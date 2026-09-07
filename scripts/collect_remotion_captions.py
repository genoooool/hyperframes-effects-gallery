"""Keep author previews and original MIT components; do not claim an HTML port."""
import concurrent.futures
import hashlib
import json
import pathlib
import subprocess
from collect_official import ROOT, fetch

REPO = 'ahgsql/remotion-subtitles'
COMMIT = json.loads((ROOT/'data/research/ahgsql--remotion-subtitles.json').read_text())['sha']
BASE = f'https://raw.githubusercontent.com/{REPO}/{COMMIT}/'
NAMES = {
    'BounceCaption': '弹跳字幕', 'Caption': '标准字幕', 'ColorfulCaption': '多彩字幕',
    'ExplosiveCaption': '爆发字幕', 'FadeCaption': '淡入淡出字幕', 'FireCaption': '火焰字幕',
    'GlitchCaption': '抖动故障字幕', 'GlowingCaption': '柔光字幕', 'LightningCaption': '闪电字幕',
    'NeonCaption': '霓虹字幕', 'RotatingCaption': '旋转字幕', 'ShakeCaption': '震动字幕',
    'ThreeDishCaption': '立体字幕', 'TiltShiftCaption': '移轴字幕',
    'TypewriterCaption': '打字机字幕', 'WavingCaption': '波浪字幕', 'ZoomCaption': '缩放字幕',
}


def collect(pair):
    name, title = pair
    id = 'remotion-' + name.replace('Caption','').lower() + '-caption'
    folder = ROOT/'assets/community/remotion-subtitles'/name
    folder.mkdir(parents=True, exist_ok=True)
    originals = {}
    for source, target in [(f'src/captions/{name}.js', f'{name}.js'), (f'readme_files/{name}.gif','original.gif')]:
        p = folder/target
        if not p.exists(): p.write_bytes(fetch(BASE+source))
        originals[target] = {'url':BASE+source,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    video = folder/'preview.mp4'
    if not video.exists():
        subprocess.run(['ffmpeg','-v','error','-i',str(folder/'original.gif'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos,format=yuv420p','-movflags','+faststart','-an',str(video)],check=True)
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
    duration = float(probe['format']['duration'])
    poster = folder/'poster.jpg'
    if not poster.exists(): subprocess.run(['ffmpeg','-v','error','-ss',str(min(0.8,duration/2)),'-i',str(video),'-frames:v','1',str(poster)],check=True)
    print(name,'ready',flush=True)
    return {
        'id':id,'title':title,'en':name,'category':'字幕','origin':'remotion',
        'sourceLabel':'Remotion · ahgsql','compatibility':'Remotion 原生 · 待适配',
        'desc':f'作者提供的 {name} 字幕效果预览。保留原始 React 组件，可在 Remotion 中传入文字与样式使用。',
        'use':'短视频字幕 · 口播包装','tags':f'字幕 Remotion {name} {title}',
        'type':'remotion:component','duration':duration,'poster':str(poster.relative_to(ROOT)),
        'videoPreview':str(video.relative_to(ROOT)),
        'page':f'https://github.com/{REPO}#available-caption-templates',
        'source':f'https://github.com/{REPO}/blob/{COMMIT}/src/captions/{name}.js',
        'install':f'npm install remotion-subtitle\nimport {{ {name} }} from "remotion-subtitle";',
        'sources':[{'path':str((folder/(name+'.js')).relative_to(ROOT)),'url':BASE+f'src/captions/{name}.js'}],
        'provenance':{'commit':COMMIT,'license':'MIT','files':originals},
        'videoProvenance':{'kind':'author-gif-transcoded','url':BASE+f'readme_files/{name}.gif','sha256':hashlib.sha256(video.read_bytes()).hexdigest()},
        'previewNote':'作者原始动图转为视频，画面与节奏保持原样。原生组件用于 Remotion；尚未转换或验证为 HyperFrames 模板。',
    }


if __name__=='__main__':
    base = ROOT/'assets/community/remotion-subtitles'
    base.mkdir(parents=True,exist_ok=True)
    for name in ['LICENSE','README.md','package.json','src/core/SubtitleSequence.js','src/captions/index.js']:
        p=base/name;p.parent.mkdir(parents=True,exist_ok=True)
        if not p.exists():p.write_bytes(fetch(BASE+name))
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        items=list(pool.map(collect,NAMES.items()))
    (ROOT/'data/community-effects.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
