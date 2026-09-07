"""Build canonical display cards without deleting or mutating source collections."""
import copy
import hashlib
import json
from collections import Counter,defaultdict
from collect_official import ROOT

COLLECTIONS=['official','community','ali','native-caption','gl','social','round3','round3-official','shotcraft']

def deduplicate(items,rules):
 by_id={e['id']:e for e in items}
 if len(by_id)!=len(items):raise ValueError('Duplicate source IDs')
 redirects={};groups={};used=set()
 for group in rules['groups']:
  members=group['members']
  if len(members)<2 or not all(i in by_id for i in members):raise ValueError('Incomplete group '+group['key'])
  if used.intersection(members):raise ValueError('Overlapping dedup groups')
  if len({by_id[i]['category'] for i in members})!=1:raise ValueError('Cross-category merge')
  used.update(members)
  canonical=min(members,key=lambda i:(by_id[i]['origin']!='official',members.index(i)))
  groups[canonical]=group
  for i in members:
   if i!=canonical:redirects[i]=canonical
 output=[]
 for original in items:
  if original['id'] in redirects:continue
  item=copy.deepcopy(original);group=groups.get(item['id'])
  if group:
   item['dedupGroup']=group['key'];item['dedupReason']=group['reason']
   item['alternatives']=[copy.deepcopy(by_id[i]) for i in group['members'] if i!=item['id']]
   item['searchAliases']=' '.join(' '.join(str(a.get(k,'')) for k in ['id','title','en','sourceLabel']) for a in item['alternatives'])
   if group.get('title'):item['title']=group['title']
   if group.get('officialVariant'):item['usageCaveat']=(item.get('usageCaveat','')+' 官方组合内可选子效果：'+group['officialVariant']+'；按需要选择具体方向和缓动，不要直接把整段组合演示当转场素材。').strip()
  output.append(item)
 return output,redirects

def main():
 items=sum([json.loads((ROOT/f'data/{n}-effects.json').read_text()) for n in COLLECTIONS],[])
 rules=json.loads((ROOT/'data/dedup-rules.json').read_text())
 for group in rules['groups']:
  for p in group['evidence']:
   if not (ROOT/p).exists():raise ValueError('Missing evidence '+p)
 displayed,redirects=deduplicate(items,rules)
 for e in items:
  for key in ['poster','videoPreview']:
   if not (ROOT/e[key]).is_file() or not (ROOT/e[key]).stat().st_size:raise ValueError(e['id']+' missing '+key)
 hashes=defaultdict(list)
 for e in items:hashes[hashlib.sha256((ROOT/e['videoPreview']).read_bytes()).hexdigest()].append(e['id'])
 audit={'rawCount':len(items),'displayCount':len(displayed),'mergedCount':len(redirects),'groups':rules['groups'],'redirects':redirects,
        'identicalVideos':[ids for ids in hashes.values() if len(ids)>1],'keepSeparate':rules['keepSeparate']}
 (ROOT/'data/gallery-effects.json').write_text(json.dumps({'effects':displayed,'redirects':redirects,'rawCount':len(items),'mergedCount':len(redirects)},ensure_ascii=False,indent=2))
 (ROOT/'data/dedup-report.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
 p=ROOT/'data/collection.json';meta=json.loads(p.read_text());meta.update({'count':len(displayed),'raw_count':len(items),'merged_count':len(redirects),'official_count':sum(e['origin']=='official' for e in displayed),'community_count':sum(e['origin']!='official' for e in displayed),'sources':dict(Counter(e['sourceLabel'] for e in displayed)),'category_counts':dict(Counter(e['category'] for e in displayed)),'video_mib':round(sum((ROOT/e['videoPreview']).stat().st_size for e in displayed)/1048576,2),'poster_mib':round(sum((ROOT/e['poster']).stat().st_size for e in displayed)/1048576,2)})
 p.write_text(json.dumps(meta,ensure_ascii=False,indent=2));print(json.dumps(meta,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
