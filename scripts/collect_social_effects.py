"""Collect official social-video primitives into six additional usage categories."""
import base64
import concurrent.futures
import hashlib
import json
import re
import subprocess
from collect_official import ROOT, BASE, COMMIT, fetch

GROUPS = {
 '镜头运动': {
  'yt-camera-move':('镜头推近与平移','对视频、图片或卡片容器做推进、平移与倾斜，重点时刻配合边缘失焦。'),
  'pan-stations':('横移逐站展示','镜头沿连续排列的内容横向移动，在每一站短暂停留。'),
  'parallax-zoom':('视差推进','中心卡片放大占据画面，周围卡片向外移动，形成空间层次。'),
  'parallax-unzoom':('视差拉远','从一张近景卡片拉远，显露周围卡片组成的完整布局。'),
  'camera-dolly-zoom':('滑动变焦','主体大小基本不变，背景随镜头与视角反向变化而压缩或展开；需要多层深度素材。'),
 },
 '局部强调': {
  'hw-arrow':('手绘箭头','箭头沿路径画出，带轻微手绘抖动，用来指示画面中的目标。'),
  'hw-callout-circle':('手绘圈选标注','用手绘圆圈、连接线与标签圈出要说明的细节。'),
  'yt-feather-highlight':('柔边聚光','压暗周围画面，留下可移动、可缩放的柔边椭圆亮区。'),
  'ui-focus-zoom':('界面局部放大','先展示完整界面，再推近指定区域并保持，适合截图和操作讲解。'),
  'outline-draw':('描边圈重点','圆角轮廓沿边缘顺时针描画，强调指定的卡片或区域。'),
 },
 '素材展示': {
  'before-after-wipe':('前后对比擦看','前后两份素材由分割线擦开，最后停留在指定对比位置。'),
  'split-tilt-cards':('双卡片对照','左右卡片从两侧翻入，在统一透视下并排展示内容。'),
  'browser-device-stage':('屏幕展示框','把截图、视频或 HTML 放入浏览器、窗口或手机外框，进入后稳定展示。'),
  'screen-flow-carousel':('多屏轮播','两到五张画面在横向轨道上切换，中心放大、两侧退后。'),
  'multi-device-splay':('多设备展开','手机、平板与电脑模型从一叠展开，展示同一产品的不同画面。'),
 },
 '节奏与情绪': {
  'camera-shake':('镜头震动','可定位时间的程序化震动，包含手持、长焦等多种镜头风格。'),
  'beat-accent':('节拍冲击','在指定节拍短暂闪光并轻微放大主体，迅速回落。'),
  'freeze-frame-dressing':('定格剪贴包装','用纸张、胶带和闪光包装定格或抠出的主体；需先提供定格画面。'),
  'echo-trail':('动作残影','运动元素带出多个延迟残影，停下后残影逐步归拢。'),
 },
 '信息提示': {
  'count-up':('数字递增','数值从起点平滑增长到目标，落定时轻微放大强调。'),
  'number-wheel':('滚轮数字','每位数字像滚轮一样切换，适合价格、计数与分数。'),
  'conic-progress-ring':('环形进度','圆环填充角度与中心数字同步增长到指定百分比。'),
  'success-check':('完成勾选','圆环弹入后画出对勾，提示完成或正确结果。'),
  'marker-checklist-card':('手写步骤清单','纸面清单逐行出现并画出勾选，用手绘圈线突出其中的信息。'),
 },
 '画面质感': {
  'grain-overlay':('胶片颗粒','为原画面叠加活动胶片颗粒，增加模拟胶片的纹理。'),
  'vignette':('柔和暗角','在边缘叠加渐变暗角，把注意力引向中心；这是静态画面处理。'),
  'grain-field':('漂移颗粒场','带轻微明暗变化的有色颗粒场循环漂移，作为画面纹理背景。'),
  'organic-light-leak-overlay':('自然漏光','有限时长的柔和彩色漏光，用来烘托回忆或情绪片段。'),
 },
}


def collect(entry):
 name,title,desc,category=entry
 tree=json.loads((ROOT/'data/research/heygen-com--hyperframes.json').read_text())
 registry=next(x['path'] for x in tree['tree'] if x['path'].endswith('/'+name+'/registry-item.json'))
 kind=registry.split('/')[1];folder=ROOT/'assets/official'/name;folder.mkdir(parents=True,exist_ok=True)
 def asset(relative,url):
  path=folder/relative;path.parent.mkdir(parents=True,exist_ok=True)
  if not path.exists():path.write_bytes(fetch(url))
  return path
 meta_path=asset('registry-item.json',BASE+registry);meta=json.loads(meta_path.read_text())
 preview_url=BASE+f'docs/public/catalog/{kind}/{name}.json';preview=asset('preview.json',preview_url)
 sources=[]
 for file in meta['files']:
  p=file if isinstance(file,str) else file['path'];url=BASE+f'registry/{kind}/{name}/{p}';saved=asset('source/'+p,url)
  sources.append({'path':str(saved.relative_to(ROOT)),'url':url,'sha256':hashlib.sha256(saved.read_bytes()).hexdigest()})
 video=folder/'preview.mp4';video_url=meta.get('preview',{}).get('video')
 if video_url and not video.exists():video.write_bytes(fetch(video_url))
 item={'id':name,'title':title,'en':meta['title'],'category':category,'origin':'official','sourceLabel':'HyperFrames 官方',
       'compatibility':'HyperFrames 原生','type':meta['type'],'desc':desc,'sourceDescription':meta['description'],
       'use':category+' · 社交短视频','tags':' '.join(meta['tags'])+' '+title,'duration':0,
       'poster':str((folder/'poster.jpg').relative_to(ROOT)),'videoPreview':str(video.relative_to(ROOT)),
       'page':f'https://hyperframes.heygen.com/catalog/{kind}/{name}',
       'source':f'https://github.com/heygen-com/hyperframes/tree/{COMMIT}/registry/{kind}/{name}',
       'install':f'npx hyperframes add {name}','sources':sources,'preview':str(preview.relative_to(ROOT)),
       'provenance':{'commit':COMMIT,'preview_url':preview_url,'preview_sha256':hashlib.sha256(preview.read_bytes()).hexdigest()},
       'previewLabel':'官方示例' if video_url else '官方源码实渲',
       'videoProvenance':{'kind':'official-video' if video_url else 'locally-rendered-official-preview','url':video_url},
       'previewNote':'官方示例，保留原始模板和演示素材。分类由本库按实际用途整理，不代表官方原有分类。'}
 if name=='camera-dolly-zoom':item['usageCaveat']='该效果需要主体与背景位于不同深度；单张平面素材无法直接产生真实的滑动变焦。先检查项目是否有分层素材。'
 if name=='freeze-frame-dressing':item['usageCaveat']='模板提供的是定格画面的剪贴包装，不会自动从视频生成定格或抠像。先准备指定时刻的静帧或透明主体。'
 if name=='grain-field':item['usageCaveat']='这是独立颗粒背景；如果用于实拍素材上方，需先处理透明度或混合方式并检查主体是否被遮挡。'
 published=ROOT/'data/social-effects.json'
 if video.exists() and published.exists():
  previous=next((e for e in json.loads(published.read_text()) if e['id']==name),None)
  if previous:
   item['videoProvenance']=previous['videoProvenance'];item['previewLabel']=previous['previewLabel']
 # Transport-only preparation: materialize included HTML; animation code stays original.
 counter=[0]
 def localize(html):
  html=re.sub(r'<base\b[^>]*>','',html)
  html=html.replace('https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js','assets/vendor/gsap-3.14.2.min.js')
  for file in meta['files']:
   relative=file if isinstance(file,str) else file['path']
   if not relative.endswith('.html'):
    html=html.replace(relative,str((folder/'source'/relative).relative_to(ROOT)))
  def child(match):
   counter[0]+=1;p=folder/f'preview-child-{counter[0]}.html';p.write_text(localize(base64.b64decode(match[1]).decode()));return 'data-composition-src="'+str(p.relative_to(ROOT))+'"'
  return re.sub(r'data-composition-src="data:text/html;base64,([^"]+)"',child,html)
 (folder/'social-render.html').write_text(localize(json.loads(preview.read_text())['html']))
 print('PREPARED',name,'video' if video.exists() else 'render',flush=True)
 return item


if __name__=='__main__':
 entries=[(name,title,desc,category) for category,group in GROUPS.items() for name,(title,desc) in group.items()]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:items=list(pool.map(collect,entries))
 (ROOT/'data/social-candidates.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
