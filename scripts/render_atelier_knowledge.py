"""Check and render the authored batch; reuse only hash-identical verified output."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'data/qa/atelier-knowledge'
RENDERER='0.8.34'

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
 actual=subprocess.check_output(['npx','--no-install','hyperframes','--version'],cwd=ROOT,text=True).strip()
 if actual!=RENDERER:raise SystemExit(f'Expected HyperFrames {RENDERER}, found {actual}; review renderer change before reusing receipts.')
 QA.mkdir(parents=True,exist_ok=True)
 candidates=json.loads((ROOT/'data/atelier-candidates.json').read_text())
 results=[]; ready=[]
 for item in candidates:
  folder=(ROOT/item['source']).parent; key=item['id']; receipt=QA/(key+'.json')
  # Gallery MP4s need an opaque preview background; downloadable defaults stay transparent.
  preview_variables=QA/(key+'-preview-variables.json')
  preview_variables.write_text(json.dumps({**json.loads((folder/'default.json').read_text()),'transparent':False},ensure_ascii=False,indent=2)+'\n')
  inputs={p.name:sha(p) for p in [folder/'index.html',folder/'gsap.min.js',folder/'default.json',preview_variables]}
  old=json.loads(receipt.read_text()) if receipt.exists() else {}
  video=ROOT/item['videoPreview'];poster=ROOT/item['poster']
  reusable=old.get('ok') and old.get('inputs')==inputs and old.get('renderer')==RENDERER and video.exists() and poster.exists() and sha(video)==old.get('videoSha256') and sha(poster)==old.get('posterSha256')
  if reusable:
   item['videoProvenance']=old['videoProvenance'];ready.append(item);results.append(old);print('REUSE',key,flush=True);continue
  record={'id':key,'inputs':inputs,'renderer':RENDERER,'ok':False}
  try:
   check=subprocess.run(['npx','--no-install','hyperframes','check',str(folder),'--json'],cwd=ROOT,capture_output=True,text=True,timeout=180)
   (QA/(key+'-check.json')).write_text(check.stdout)
   if check.returncode:raise RuntimeError('check failed; inspect '+str(QA/(key+'-check.json')))
   report=json.loads(check.stdout)
   if not report['ok'] or not report['layout']['samples']:raise RuntimeError('No valid check samples')
   with (QA/(key+'-render.log')).open('w') as log:
    subprocess.run(['npx','--no-install','hyperframes','render',str(folder),'--output',str(video),'--fps','24','--quality','standard','--workers','1','--strict-variables','--variables-file',str(preview_variables)],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=240)
   probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
   duration=float(probe['format']['duration']); stream=next(s for s in probe['streams'] if s['codec_type']=='video')
   if abs(duration-6)>.1 or stream['width']!=960 or stream['height']!=540:raise RuntimeError('Unexpected video size/duration')
   subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],check=True,capture_output=True)
   subprocess.run(['ffmpeg','-v','error','-y','-ss','4.6','-i',str(video),'-frames:v','1','-vf','scale=640:360',str(poster)],check=True)
   provenance={'kind':'independently-authored-local-render','renderer':'hyperframes@'+RENDERER,'sha256':sha(video),'fps':24,'duration':duration,'sourceSha256':inputs['index.html']}
   record.update(ok=True,videoSha256=sha(video),posterSha256=sha(poster),videoProvenance=provenance)
   item['videoProvenance']=provenance;ready.append(item);print('READY',key,flush=True)
  except Exception as exc:record['error']=str(exc);print('FAILED',key,str(exc),flush=True)
  receipt.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');results.append(record)
 (QA/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 if len(ready)!=len(candidates):raise SystemExit('Batch remains unpublished: '+str(len(ready))+'/'+str(len(candidates)))
 (ROOT/'data/atelier-effects.json').write_text(json.dumps(ready,ensure_ascii=False,indent=2)+'\n')
 print('PUBLISHED BATCH',len(ready),flush=True)

if __name__=='__main__':main()
