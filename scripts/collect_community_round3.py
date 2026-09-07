"""Collect selected source primitives and their dependency closure at pinned commits."""
import hashlib
import json
import re
import posixpath
from collect_official import ROOT, fetch

UI = {
 'confetti-burst': ('纸屑庆祝', '节奏与情绪', '彩色纸屑向上喷出，在重力与空气阻力作用下飘落。'),
 'squash-stretch': ('挤压回弹', '节奏与情绪', '元素在落定时挤压、拉伸再回弹，增强动作重量感。'),
 'reaction-burst': ('表情反应喷发', '节奏与情绪', '点赞与表情沿画面侧边持续上浮、摇摆并淡出，用于情绪回应。'),
 'scanline-crt': ('CRT 显像管', '画面质感', '在原画面上叠加扫描线、RGB 点阵与轻微闪烁。'),
 'depth-of-field-blur': ('景深移焦', '镜头运动', '在前后景之间转移清晰区域，用景深变化引导注意。'),
 'caustics-bg': ('水面焦散光', '画面质感', '模拟水面折射形成的流动亮纹，作为氛围背景。'),
 'orbit-motion': ('环绕运动', '镜头运动', '元素沿可设定的椭圆轨道环绕，支持朝向随路径旋转。'),
 'progress-bar': ('线性进度', '信息提示', '进度条从起点增长至目标，支持分段、标记和数值。'),
 'countdown-timer': ('倒计时提示', '信息提示', '倒计时数字与环形剩余进度同步变化，最后触发完成状态。'),
 'comment-callout': ('评论回复浮层', '信息提示', '评论卡进入，圈出关注内容、点赞，再逐字显示回复。演示身份与数据仅为占位。'),
 'poll-overlay': ('投票结果浮层', '信息提示', '投票选项与结果条逐项展开，突出选中答案。预览比例仅为演示。'),
}
ROUGH = {'underline': '手绘下划线', 'highlight': '荧光笔划重点', 'crossed-off': '手绘叉除', 'bracket': '段落括号标注'}

def collect_ui():
 repo='riaz37/remotion-ui';tree=json.loads((ROOT/'data/research/riaz37--remotion-ui.json').read_text())
 sha=tree['sha'];entries={e['path']:e for e in tree['tree']};base=ROOT/'assets/community/remotion-ui'
 prefix='apps/web/registry/bases/default/';saved={}
 def retrieve(p):
  if p in saved:return
  out=base/p;out.parent.mkdir(parents=True,exist_ok=True)
  if not out.exists():out.write_bytes(fetch(f'https://raw.githubusercontent.com/{repo}/{sha}/{p}'))
  payload=out.read_bytes();assert hashlib.sha1(b'blob '+str(len(payload)).encode()+b'\0'+payload).hexdigest()==entries[p]['sha'],p
  saved[p]={'path':str(out.relative_to(ROOT)),'sha256':hashlib.sha256(payload).hexdigest()}
  if not p.endswith(('.tsx','.ts')):return
  for spec in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]',payload.decode()):
   if spec.startswith('@/remotion/'):target=prefix+spec[len('@/remotion/'):]
   elif spec.startswith('.'):target=posixpath.normpath(posixpath.join(posixpath.dirname(p),spec))
   else:continue
   resolved=next((x for x in [target,target+'.ts',target+'.tsx',target+'/index.ts',target+'/index.tsx'] if x in entries),None)
   if not resolved:raise ValueError('Unresolved '+p+' -> '+spec)
   retrieve(resolved)
 retrieve('LICENSE');retrieve('package.json')
 items=[]
 for name,(title,category,desc) in UI.items():
  file=next(p for p in entries if p.startswith(prefix) and (p.endswith('/'+name+'.tsx') or p.endswith('/'+name+'/index.tsx')))
  retrieve(file)
  folder=base/'previews'/name;folder.mkdir(parents=True,exist_ok=True)
  export=re.search(r'export const (\w+)',(base/file).read_text())[1]
  items.append({'id':'rui-'+name,'en':export,'title':title,'category':category,'origin':'remotion','sourceLabel':'Remotion · RemotionUI',
   'compatibility':'Remotion 原生 · 待适配','type':'remotion:component','desc':desc,'use':category+' · 社交短视频','tags':name+' '+title,
   'duration':6 if name in ['countdown-timer','comment-callout','poll-overlay'] else 4,
   'poster':str((folder/'poster.jpg').relative_to(ROOT)),'videoPreview':str((folder/'preview.mp4').relative_to(ROOT)),
   'page':f'https://remotionui.com/docs/components/{name}','source':f'https://github.com/{repo}/blob/{sha}/{file}',
   'install':f'在 Remotion 项目中执行 npx remotion-ui add {name}，或读取固定版本源码及 @/remotion/lib/ 依赖。组件导出名：{export}。',
   'previewLabel':'源码实渲','sources':[saved[file]],'provenance':{'commit':sha,'license':'MIT'},
   'videoProvenance':{'kind':'original-react-render','renderer':'Remotion Player 4.0.441','fps':24},
   'renderProps':{'library':'remotion-ui','variant':name,'export':export,'file':str((base/file).relative_to(ROOT))},
   'previewNote':'使用作者原始 React 组件实渲，背景、示例内容和参数由本库提供；未移植到 HyperFrames。Inter 使用本地同款字体。'} )
 (base/'source-manifest.json').write_text(json.dumps({'commit':sha,'files':list(saved.values())},ensure_ascii=False,indent=2))
 fonts=base/'fonts';fonts.mkdir(exist_ok=True)
 font_css=fonts/'upstream.css';font_url='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
 if not font_css.exists():font_css.write_bytes(fetch(font_url))
 css=font_css.read_text();font_files=[]
 for i,url in enumerate(dict.fromkeys(re.findall(r'url\(([^)]+)\)',css))):
  p=fonts/f'inter-{i}.woff2'
  if not p.exists():p.write_bytes(fetch(url))
  font_files.append({'url':url,'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
  css=css.replace(url,'/'+str(p.relative_to(ROOT)))
 (fonts/'local.css').write_text(css)
 (fonts/'manifest.json').write_text(json.dumps({'css_source':font_url,'files':font_files},indent=2))
 print('UI source closure',len(saved),flush=True)
 return items

def collect_rough():
 repo='rough-stuff/rough-notation';tree=json.loads((ROOT/'data/research/rough-stuff--rough-notation.json').read_text());sha=tree['sha']
 base=ROOT/'assets/community/rough-notation';base.mkdir(parents=True,exist_ok=True);sources=[]
 for e in tree['tree']:
  if e['type']=='blob' and (e['path'].startswith('src/') or e['path'] in ['LICENSE','package.json','README.md']):
   p=base/e['path'];p.parent.mkdir(parents=True,exist_ok=True)
   if not p.exists():p.write_bytes(fetch(f'https://raw.githubusercontent.com/{repo}/{sha}/{e["path"]}'))
   payload=p.read_bytes();assert hashlib.sha1(b'blob '+str(len(payload)).encode()+b'\0'+payload).hexdigest()==e['sha']
   sources.append({'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(payload).hexdigest()})
 version=json.loads((base/'package.json').read_text())['version']
 bundle=base/'rough-notation.iife.js';url=f'https://cdn.jsdelivr.net/npm/rough-notation@{version}/lib/rough-notation.iife.js'
 if not bundle.exists():bundle.write_bytes(fetch(url))
 items=[]
 for variant,title in ROUGH.items():
  folder=base/'previews'/variant;folder.mkdir(parents=True,exist_ok=True)
  items.append({'id':'rough-'+variant,'en':variant,'title':title,'category':'局部强调','origin':'web','sourceLabel':'Rough Notation',
   'compatibility':'Web SVG 原生 · 待适配','type':'web:annotation','desc':title+'沿笔画逐步画出，标注目标文字或区域，不是独立标题动画。',
   'use':'讲解标注 · 局部强调','tags':variant+' 手绘 标注','duration':3,'poster':str((folder/'poster.jpg').relative_to(ROOT)),
   'videoPreview':str((folder/'preview.mp4').relative_to(ROOT)),'page':'https://roughnotation.com/','source':f'https://github.com/{repo}/tree/{sha}/src',
   'install':f'npm install rough-notation@{version}\n使用 annotate(element, {{type: "{variant}"}}) 创建标注。',
   'previewLabel':'源码实渲','sources':sources,'provenance':{'commit':sha,'license':'MIT','version':version},
   'videoProvenance':{'kind':'original-web-library-render','bundle_url':url,'bundle_sha256':hashlib.sha256(bundle.read_bytes()).hexdigest(),'fps':24},
   'renderProps':{'library':'rough','variant':variant},
   'usageCaveat':'原库由浏览器 CSS 动画驱动；接入 HyperFrames 时需要将笔画进度绑定到可定位的时间轴，并固定随机种子，检查跳转及导出一致性。',
   'previewNote':'调用作者原版 Rough Notation 绘制 SVG，示例内容由本库提供。预览逐帧定位原生 CSS 动画；未封装为 HyperFrames 模板。'})
 return items

if __name__=='__main__':
 items=collect_ui()+collect_rough()
 (ROOT/'data/round3-candidates.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
 # Originals found while comparing third-party overlap. Keep a separate batch.
 from collect_social_effects import collect
 matches=[('hw-underline','手绘重点标记','手绘下划线、删除线与括号沿笔画画出，标注当前重点。','局部强调'),('marker-highlight','荧光笔划重点','荧光笔色块沿目标内容扫过，突出要讲解的信息。','局部强调'),('confetti','彩纸庆祝','彩色纸屑散开并飘落，强调完成与庆祝时刻。','节奏与情绪')]
 target=ROOT/'data/round3-official-candidates.json'
 if not target.exists():target.write_text(json.dumps([collect(e) for e in matches],ensure_ascii=False,indent=2))
 print('Candidates',len(items))
