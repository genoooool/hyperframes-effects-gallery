"""Render only missing original previews, publish after media validation."""
import hashlib
import json
import subprocess
import concurrent.futures
import urllib.request
import sys
from collect_official import ROOT

collection=sys.argv[1] if len(sys.argv)>1 else 'social'
items=json.loads((ROOT/f'data/{collection}-candidates.json').read_text());done=[];errors=[]
logs=ROOT/'data/qa'/('social-expansion' if collection=='social' else collection);logs.mkdir(parents=True,exist_ok=True)
def discover(item):
 video=ROOT/item['videoPreview']
 if video.exists():return
 kind='blocks' if item['type']=='hyperframes:block' else 'components'
 url=f'https://static.heygen.ai/hyperframes-oss/docs/images/catalog/{kind}/{item["id"]}.mp4'
 try:
  with urllib.request.urlopen(url,timeout=10) as response:payload=response.read()
  if b'ftyp' not in payload[:32]:return
  video.write_bytes(payload);item['previewLabel']='官方示例'
  item['videoProvenance']={'kind':'official-catalog-video','url':url,'discovery':'Official catalog asset URL; not declared in pinned registry metadata'}
  print('FOUND OFFICIAL VIDEO',item['id'],flush=True)
 except Exception:pass
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(discover,items))
for item in items:
 try:
  video=ROOT/item['videoPreview'];folder=video.parent
  if not video.exists():
   with (logs/(item['id']+'.log')).open('w') as output:
    subprocess.run(['npx','--no-install','hyperframes','render',str(ROOT),'-c',str((folder/'social-render.html').relative_to(ROOT)),
                    '-o',str(video),'--fps','24','--quality','draft','--workers','1'],cwd=ROOT,stdout=output,stderr=subprocess.STDOUT,check=True,timeout=240)
   item['videoProvenance']['renderer']='hyperframes@0.8.30'
  info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
  item['duration']=float(info['format']['duration'])
  if item['id']=='success-check':
   original=video;video=folder/'preview-detail.mp4'
   if not video.exists():
    subprocess.run(['ffmpeg','-v','error','-i',str(original),'-vf','crop=384:216,scale=640:360','-an','-c:v','libx264','-crf','20','-movflags','+faststart',str(video)],check=True)
   item['videoPreview']=str(video.relative_to(ROOT))
   item['videoProvenance']['originalVideo']=str(original.relative_to(ROOT))
   item['videoProvenance']['originalSha256']=hashlib.sha256(original.read_bytes()).hexdigest()
   item['videoProvenance']['presentationCrop']='Center 384x216 scaled to 640x360; original animation unchanged'
   item['previewNote']+=' 为便于观察，预览放大了原始演示的中心区域，动画未改写，完整原片保留在本地。'
  poster=ROOT/item['poster']
  if not poster.exists():
   poster_time=item['duration']*.7 if item['id']=='parallax-unzoom' else min(1.5,item['duration']/2)
   if item['id']=='marker-checklist-card':poster_time=3.8
   subprocess.run(['ffmpeg','-v','error','-ss',str(poster_time),'-i',str(video),'-frames:v','1','-vf','scale=640:-2',str(poster)],check=True)
  item['videoProvenance']['sha256']=hashlib.sha256(video.read_bytes()).hexdigest()
  done.append(item);print('READY',len(done),'/',len(items),item['id'],flush=True)
 except Exception as error:
  errors.append({'id':item['id'],'error':str(error)});print('FAILED',item['id'],str(error),flush=True)
(ROOT/f'data/{collection}-effects.json').write_text(json.dumps(done,ensure_ascii=False,indent=2))
(logs/'render-results.json').write_text(json.dumps({'ready':len(done),'errors':errors},ensure_ascii=False,indent=2))
if errors:raise SystemExit(1)
