"""Collect author previews and unmodified source at a pinned Shotcraft revision.

The gallery's MP4s are hosted separately from Git. Their URL, retrieval time and
SHA-256 are recorded independently; a source commit does not pin those videos.
No installation, rendering or HyperFrames adaptation is performed here.
"""
import concurrent.futures
import datetime
import hashlib
import json
import re
import subprocess
import urllib.parse
import urllib.request
from collections import Counter
from collect_official import ROOT, fetch

REPO = 'Vincentwei1021/video-shotcraft'
COMMIT = '5f047c7cfe10d6616fe59160a750fcfaea510b2e'
BASE = ROOT / 'assets/community/video-shotcraft'
RAW = f'https://raw.githubusercontent.com/{REPO}/{COMMIT}/'
GALLERY = 'https://vincentwei1021.github.io/video-shotcraft/'

# Preserve the existing eight-category scope. Typography that represents a
# document, code or changing UI state is an information cue, not a title.
EXTRA = {
 'document-typewriter-reveal': '信息提示', 'typing-code-block': '信息提示',
 'glitch-cycle': '信息提示', 'pill-slot-cycle': '信息提示',
 'pill-chip-slot-cycle-handled': '信息提示',
 'type-rhythm-sync': '字幕',
 'crane-rise-reveal': '镜头运动', 'dataviz-landscape-open': '素材展示',
 'icon-field-colorize': '信息提示', 'magician-card-flourish': '素材展示',
 'spotlight-hero-card': '素材展示', 'fracture': '素材展示',
 'outro-group-photo-launch': '素材展示', 'ui-strip-away-outro': '素材展示',
}
CATEGORY = {'camera':'镜头运动', 'data':'信息提示', 'effects':'局部强调',
 'interaction':'信息提示', 'rhythm':'节奏与情绪', 'transition':'转场', 'ui-entrance':'素材展示'}
OVERRIDE = {
 'aurora-bloom-bg-flip':'画面质感', 'brand-frame-snap':'画面质感',
 'line-boil':'画面质感', 'riso-print-hits':'画面质感',
 'glow-flyline-moves':'画面质感', 'impact-feedback':'节奏与情绪',
 'slam-entrance-moves':'节奏与情绪', 'counter-confetti':'节奏与情绪',
 'particle-celebrate-hits':'节奏与情绪', 'before-after-slider-scrub':'素材展示',
 'bezier-source-converge-merge':'信息提示', 'integration-hub-map':'信息提示',
 'doc-park-left-pill-deal':'信息提示', 'element-body-moves':'节奏与情绪',
 'runway-ground-skim':'镜头运动', 'radial-wave':'节奏与情绪',
}
TITLES = dict(line.split('|',1) for line in '''ai-stream-response|AI 流式回答
assemble-then-type-flyin|组件与文字分步飞入
aurora-bloom-bg-flip|极光背景翻色
autolayout-gap-dial|间距旋钮联动
avatar-bracket-carousel|对焦框头像轮播
avatar-grid-radial-build-colorize|网格生长与异常染色
basic-3d-scene|空间卡片巡游
beat-cut-moves|节拍硬切
beat-step-list-theme-cycle|列表逐拍换色
before-after-slider-scrub|前后对比拉杆
bezier-source-converge-merge|曲线路径多源汇聚
bottom-push-stack-wipe|底边上推换景
brand-frame-snap|画框同步翻色
bubble-swarm-takeover|气泡群遮屏
canvas-materialize-moves|画布内容物化
card-flip-reveal|卡片翻面揭示
card-flock-tumble|卡群翻滚聚散
card-stack|卡堆弹入展扇
carousel-3d|三维卡片轮播
chart-live-moves|动态图表
chip-grid-single-select-blackout|选项按压聚焦
chip-lift-to-user-pill|选项变形身份胶囊
circle-match-iris|圆形匹配光圈
cloner-depth-echo|卡片纵深残影
collab-cursor-moves|协作光标表演
color-block-step-wipe|色块步进擦除
command-palette-summon|命令面板召出
counter-confetti|数字冲刺与纸屑
crane-rise-reveal|升起拉远揭示
crash-zoom-punch|六帧冲近
cube-navigation|立方体空间导航
cursor-flyover|光标引导巡游
cycle-glass-node-morph|循环节点玻璃变形
dashboard-glow-highlight-pill|面板流光聚焦
dataviz-landscape-open|数据景观穿行
deck-deal-flyin|发牌飞入网格
depth-layer-moves|分层深度运镜
doc-park-left-pill-deal|文档侧停逐项揭示
document-typewriter-reveal|文档逐字写入
draw-svg-trace|描边揭示素材
element-body-moves|元素弹性与离地感
floating-glossy-label-pills|悬浮标签队列
fracture|碎片波纹拼合
fui-hud-moves|科技面板与准星
gauge-readout-moves|仪表读数
glass-pill-dictation-typing|玻璃胶囊输入
glitch-cycle|状态文字故障轮换
glow-flyline-moves|光球与飞线
gradient-transition|渐变背景转场
graze-face-tour|贴面空间巡游
hashtag-to-pill-materialize|标签生成胶囊
hatch-depth|排线深度展示
icon-field-colorize|图标场局部染色
icon-performance-moves|图标动作反馈
impact-feedback|冲击反馈
input-trigger-moves|输入触发反馈
integration-hub-map|集成节点连线图
light-play-moves|光影扫过
line-boil|手绘线条沸腾
line-carry-transition|线条承接转场
list-reveal|列表逐项揭示
list-stack-press|列表堆叠压合
magician-card-flourish|魔术花切卡牌
montage-rhythm-moves|蒙太奇节奏
morph-from-primitive|几何体变形展开
mosaic-reframe|马赛克重新构图
neon-frame-forerun|霓虹边框先行
neon-frame-orbit-drop|霓虹框环绕落位
odometer-digit-roll|里程表数字滚动
outro-group-photo-launch|卡片合影拉远
overhead-camera-moves|俯拍空间揭示
page-turn-transitions|翻页空间转场
page-waterfall-wall|页面瀑布墙
panel-grid-moves|分屏网格编排
paper-craft-moves|纸艺素材入场
paper-plane-messenger|纸飞机传递转场
particle-celebrate-hits|粒子庆祝反馈
particle-sand-fill|粒子沙流填充
picker-carousel-feature-cycle|选择器功能轮换
pill-chip-slot-cycle-handled|胶囊选项滚槽
pill-slot-cycle|胶囊内容滚动
platform-hinge-rise|平台铰链升起
print-texture-transitions|墨迹渗透揭示
product-card-progressive-assemble|产品卡逐层组装
quad-split-parallel-scenes|四分屏平行动作
radial-ripple-phone-chips|手机卡片径向涟漪
radial-wave|径向波动
research-card-stack-scroll|资料卡堆叠滚动
rhythm-interrupt-moves|节奏打断
ring-diagram-annotation-reveal|环形图解逐项标注
riso-print-hits|孔版印刷错位
row-embed|卡片嵌入列表
runway-ground-skim|贴地掠过运镜
sakuga-timing-shift|动画抽帧变速
scan-bracket-sweep|扫描括号扫过
scanline-annotate-focus|扫描线聚焦标注
scanline-assemble-flyin|扫描线组装飞入
scroll-brake-moves|滚动急停聚焦
segmented-thumb-hero|分段滑块焦点
shot-transitions|镜头衔接
skeleton-reveal|骨架屏揭示
slam-entrance-moves|冲击入场
smear-multiples|拖影与多重残像
space-camera-moves|空间运镜
spectrum-morph-ui|频谱变形界面
speed-ramp-freeze|变速与定格
spotlight-hero-card|聚光卡片揭示
spotlight-sweep-moves|聚光灯焦点转移
steep-tilt-glide|陡倾滑行运镜
svg-shape-morph|矢量轮廓变形
tear-streak-transitions|撕裂错位转场
tension-camera-moves|张力运镜
terminal-3d|终端三维展开
theme-switch-moves|主题切换
timeline-travel|时间线穿行
trailer-grammar-moves|预告片节奏
transition-hidden-cut|遮挡隐藏切镜
transition-travel|连续形态转场
type-and-filter|输入与筛选联动
typing-code-block|代码逐字输入
ui-strip-away-outro|界面逐层剥离
value-stagger-gradient|数值错峰渐变入场
voice-waveform-live|实时语音波形
wall-reveal-moves|卡片墙揭示
white-flash-logo-simplify-cut|白闪简化切镜
wipe-transitions|遮罩擦除'''.splitlines())
TITLES['type-rhythm-sync'] = '随声同步字幕'

STYLE_TITLES = dict(line.split('|',1) for line in '''oscilloscope-stream|示波曲线
unit-dot-swarm-regroup|点阵重组
axis-rescale-shock|坐标轴重标
dialogue-duet|双光标对话
cast-ensemble|多人光标协作
multiplane|视差滑轨
dolly-zoom|主体锁定变焦
axial-stretch|轴向拉伸
contact-shadow-lift|离地投影
line-unfold-panel|线条展开面板
reticle-lock-on|准星锁定
needle-sweep-selftest|指针自检
tape-scroll-fixed-pointer|刻度带滚动
glow-orb-ambient|环境光球
flyline-arc|弧线飞光
orb-flyline-relay|光球飞线接力
pop-burst-confirm|弹出确认
attention-bounce|弹跳提醒
cursor-performance|光标点击
keycap-smash-cut|键帽按压切镜
spotlight-sweep|聚光扫字
sheen-sweep|斜向高光
halation-bloom|柔光晕开
tilt-reveal|倾斜抬正
overhead-tabletop-drop|俯视下落
cube-rotate|立方体翻面
barn-door-split|双扇门展开
grid-flash-mosaic|网格闪现
flip-grid-reflow|翻转重排
comic-panel-split|漫画分格
masking-tape-slap|胶带拍落
popup-book-rise|立体书展开
confetti-crossfire|交叉喷射纸屑
counter-tick-sparks|计数火花
jump-cut-punch-in|跳切冲近
strobe-black-frames|插黑频闪
misregistration-hit|套印错位
beat-pump|印刷脉冲
changelog-scroll-brake|列表滚动刹停
brake-reticle-lock|刹停准星锁定
kanada-perspective-snap|透视冲击
score-slam|分数砸入
impact-burst-kit|冲击粒子
exploded-view|爆炸分层
drone-dive-landing|俯冲落位
speed-ramp|速度骤变
freeze-annotate|定格标注
glow-wake-sleep-panel|面板醒睡扫光
slide-spotlight-pan|滑动聚光横摇
corner-spotlight-reveal|角落聚光揭示
theme-sweep-toggle|斜扫换肤
palette-theme-ripple|主题涟漪
trailer-bumper|预告短切
card-footage-cadence|字卡画面交替
smash-cut|蓄势猛切
clock-wipe|时钟擦除
blinds-slice|百叶切片'''.splitlines())

def dump(path, value):
 path.parent.mkdir(parents=True, exist_ok=True)
 path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def main():
 BASE.mkdir(parents=True, exist_ok=True)
 for name,url in [('tree.json',f'https://api.github.com/repos/{REPO}/git/trees/{COMMIT}?recursive=1'),('library.json',RAW+'gallery/api/library.json')]:
  if not (BASE/name).exists(): (BASE/name).write_bytes(fetch(url))
 tree=json.loads((BASE/'tree.json').read_text()); assert tree['sha']==COMMIT and not tree['truncated']
 entries={x['path']:x for x in tree['tree'] if x['type']=='blob'}
 library=json.loads((BASE/'library.json').read_text())
 payload=(BASE/'library.json').read_bytes()
 assert hashlib.sha1(b'blob '+str(len(payload)).encode()+b'\0'+payload).hexdigest()==entries['gallery/api/library.json']['sha']
 previous_path=ROOT/'data/qa/shotcraft/collection.json'
 previous=json.loads(previous_path.read_text()) if previous_path.exists() else {}
 validated={c['id']:c for c in previous.get('checks',[])}
 decisions=[]; selected=[]
 for card in library['cards']:
  name=card['name']; category=OVERRIDE.get(name,EXTRA.get(name,CATEGORY.get(card['category'])))
  decision={'card':name,'upstreamCategory':card['category'],'styles':[s['key'] for s in card['styles']],
   'category':category,'status':'included' if category else 'excluded',
   'reason':'属于现有八类用途，保留作者组合镜头和素材依赖说明。' if category else '纯标题排版或品牌片头片尾；现有目录不收录标题。'}
  decisions.append(decision)
  if category:
   assert name in TITLES, name
   selected.append((card,category))
 dump(BASE/'selection.json',{'commit':COMMIT,'cards':decisions})
 # Keep the complete small source/reference kit (including shared textures),
 # avoiding fragile guesses from recipe names. No audio, template build,
 # workbench, node_modules or unrelated repository history is downloaded.
 paths=[p for p in entries if p.startswith(('demos/','assets/lib/','references/shots/')) or p in ['LICENSE','README.md','package.json','assets/audio/ATTRIBUTION.md','references/shots/ATTRIBUTION.md']]
 def source(p):
  out=BASE/p; out.parent.mkdir(parents=True,exist_ok=True)
  if not out.exists():out.write_bytes(fetch(RAW+p))
  data=out.read_bytes();blob=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  assert blob==entries[p]['sha'],p
  return {'path':str(out.relative_to(ROOT)),'upstreamPath':p,'gitBlob':blob,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
  sources=[]
  for i,item in enumerate(pool.map(source,paths),1):
   sources.append(item)
   if i%60==0:print('sources',i,'/',len(paths),flush=True)
 dump(BASE/'source-manifest.json',{'repo':REPO,'commit':COMMIT,'files':sources})
 by_path={s['upstreamPath']:s for s in sources}
 jobs=[(c,cat,s,index) for c,cat in selected for index,s in enumerate(c['styles'])]
 def media(job):
  card,category,style,index=job; key=style['key']; assert re.fullmatch(r'[a-z0-9-]+',key),key
  folder=BASE/'previews'/key; folder.mkdir(parents=True,exist_ok=True)
  video=folder/'preview.mp4'; receipt=folder/'receipt.json'; url=urllib.parse.urljoin(GALLERY,style['media']['url'])
  assert urllib.parse.urlparse(url).netloc=='vincentwei1021.github.io'
  if not video.exists():
   data=fetch(url); assert b'ftyp' in data[:32],key
   video.write_bytes(data)
   dump(receipt,{'url':url,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'sourceCommit':COMMIT,'mediaCommit':None})
  record=json.loads(receipt.read_text());assert record['sha256']==hashlib.sha256(video.read_bytes()).hexdigest()
  probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
  stream=next(s for s in probe['streams'] if s['codec_type']=='video'); duration=float(probe['format']['duration'])
  cached=validated.get('shotcraft-'+key,{})
  if cached.get('sha256')!=record['sha256']:
   decode=subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],capture_output=True,text=True)
   if decode.returncode or decode.stderr.strip():raise ValueError(key+' decode failed '+decode.stderr)
  poster=folder/'poster.jpg'
  if not poster.exists():subprocess.run(['ffmpeg','-v','error','-ss',str(round(duration*.55,3)),'-i',str(video),'-frames:v','1','-vf','scale=640:-2','-q:v','3',str(poster)],check=True)
  # Recipes can point to files outside their namesake folder. The original card
  # and full source manifest are the authoritative navigation path.
  recipe=card['source']; recipe_text=(BASE/recipe).read_text()
  refs=sorted(set(re.findall(r'(?:demos|assets/lib)/[A-Za-z0-9_./-]+',recipe_text)))
  assert refs,card['name']
  implementations=[p for p in by_path if p.endswith(('.tsx','.ts')) and any(p==ref or p.startswith(ref.rstrip('/')+'/') for ref in refs)]
  assert implementations,card['name']+' missing implementations'
  title=TITLES[card['name']]
  if len(card['styles'])>1:
   label=re.sub(r'^[A-Za-z0-9_-]+\s*','',style['label']).strip()
   title+=' · '+STYLE_TITLES.get(key,label if re.search(r'[\u4e00-\u9fff]',label) else str(index+1))
  note='作者原始 MP4 预览，未重制、未移植到 HyperFrames。源码固定于 '+COMMIT[:7]+'；媒体由作者展厅单独托管，以下载时间和 SHA-256 留档，不声称与源码逐帧一致。预览为组合镜头，含示例文字、UI 或素材；实际使用须替换素材并按原卡依赖接入。'
  caveat='先读镜头配方卡并按其中的准确路径定位实现；同一卡可能包含多个动作分支，本项为 '+key+'。保留共享 Fixtures/Motion/PageCam 与所需纹理；依赖 Remotion 帧时钟，部分实现需要 motion-blur。示例文案、数字和图表不代表真实事实。'+(' 原作为文档/界面状态动画，不是语音同步字幕。' if card['category']=='typography' and category!='字幕' else '')
  item={'id':'shotcraft-'+key,'title':title,'en':key,'category':category,'origin':'remotion','sourceLabel':'Remotion · Video Shotcraft',
   'compatibility':'Remotion 原生 · 待适配','type':'remotion:shot-recipe','desc':style.get('description') or card['summary'],
   'use':style.get('use') or card['use'],'tags':' '.join([card['name'],key,card['category'],'shotcraft',title]),'duration':duration,
   'poster':str(poster.relative_to(ROOT)),'videoPreview':str(video.relative_to(ROOT)),
   'page':GALLERY+'library.html','source':f'https://github.com/{REPO}/blob/{COMMIT}/{recipe}',
   'install':f'读取原始配方卡 {recipe}，选择 {key} 分支；按卡片指向的 demos/ 实现复制所需组件与共享依赖，参照 demos/README.md 注册 Remotion Composition。',
   'previewLabel':'作者示例','sources':[by_path[recipe]]+[by_path[p] for p in implementations],'sourceManifest':str((BASE/'source-manifest.json').relative_to(ROOT)),
   'provenance':{'commit':COMMIT,'license':'Apache-2.0','repo':REPO},'videoProvenance':{'kind':'author-preview','url':url,'sha256':record['sha256'],'retrievedAt':record['retrievedAt'],'mediaCommit':None},
   'previewNote':note,'usageCaveat':caveat,'shotcraft':{'card':card['name'],'style':key,'upstreamCategory':card['category'],'referencePaths':refs}}
  return item,{'id':item['id'],'duration':duration,'width':stream['width'],'height':stream['height'],'fps':stream['avg_frame_rate'],'bytes':record['bytes'],'sha256':record['sha256'],'decode':'passed'}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  items=[];checks=[]
  for i,(item,check) in enumerate(pool.map(media,jobs),1):
   items.append(item);checks.append(check)
   if i%15==0: print('previews',i,'/',len(jobs),flush=True)
 assert len({e['id'] for e in items})==len(items)
 dump(ROOT/'data/shotcraft-effects.json',items)
 report={'commit':COMMIT,'upstreamCards':len(library['cards']),'upstreamStyles':sum(len(c['styles']) for c in library['cards']),
  'includedCards':len(selected),'includedStyles':len(items),'excludedCards':len(decisions)-len(selected),
  'categories':dict(Counter(e['category'] for e in items)),'sourceFiles':len(sources),'sourceBytes':sum(s['bytes'] for s in sources),
  'videoBytes':sum(c['bytes'] for c in checks),'checks':checks}
 dump(ROOT/'data/qa/shotcraft/collection.json',report)
 print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
