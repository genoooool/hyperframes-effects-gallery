"""Generate our own parameterized knowledge templates and candidate records.

Reference: nutllwhy/hyperframes-motion-library (concept inventory only).
No upstream template code, sample copy or rendered media is used.
"""
import html
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'assets/atelier/knowledge'
REFERENCE = 'https://github.com/nutllwhy/hyperframes-motion-library'
REF_SHA = 'fe59998fa3f2c8579ba5ddd00cbbb76131190bdb'

# Own examples; numeric examples are explicitly illustrative, never performance claims.
SPECS = [
 ('column-reveal','基线柱形展开','bar-chart-grow','bars','各阶段的素材数量','初筛|复核|整理|交付','18,32,46,60','份','柱形从同一零基线依次长出，数字落在柱顶，最后强调最大值。'),
 ('series-trace','时间序列描线','line-chart-draw','line','分阶段阅读记录','第一周|第二周|第三周|第四周|第五周','12,20,17,30,36','篇','折线逐段绘出，节点与数值跟随到达顺序出现，保留零基线。'),
 ('paired-values','双值前后对照','before-after-stat','compare','两次整理的耗时','首次整理|复用结构','48,18','分钟','两组标签和数值先后进入，细分隔线展开；不自动宣称提升比例。'),
 ('measure-bars','同尺横条比较','horizontal-bar-compare','hbars','两套样例的覆盖量','方案青|方案朱','28,44','项','两根横条共享尺度，由左向右伸展，末端标签同时落定。'),
 ('ordered-podium','排序阶梯榜','top-rank-list','rank','样例条目的阅读次数','案例甲|案例乙|案例丙','320,240,180','次','按输入数值排序，三条排名由下向上建立，首位侧标最后点亮。'),
 ('inflection-note','拐点旁注','turning-point-line','turn','一个变化节点','阶段一|阶段二|阶段三|阶段四|阶段五','12,16,19,38,45','项','趋势线与节点逐段建立，随后在指定节点下方揭示引线和解释。'),
 ('evidence-footnote','证据脚注条','source-citation-card','citation','预览与适配是两件事','资料：本库接入说明|口径：按渲染框架区分','','','来源行先出现，分隔线横向铺开，再揭示结论与统计口径。'),
 ('duo-overlay','双指标角落卡','stat-duel','duel','素材盘点','视频|图片','24,36','份','画面下方两张独立数值卡错峰进入，中间细线将比较关系连接。'),
 ('state-handoff','状态交接板','status-split','state','从收集走向可复用','收集素材|建立模板','','','两种状态错峰进入左右区域，中间箭头连接前后关系，最后并排保持。'),
 ('percent-ticks','百分比刻度落定','number-impact','meter','示例完成比例','已完成','65','%','二十段刻度沿阅读方向依次填充，末段可部分填充，和百分比严格对应。'),
 ('term-definition','术语边注','concept-spotlight','concept','什么是关键帧','关键帧|记录某一时刻的位置、大小等状态。','','','侧边注释卡从左侧进入，术语与解释随后显现，下方强调线横向展开。'),
 ('step-stair','步骤递进阶梯','three-step-flow','steps','把素材做成可复用效果','明确用途|替换内容|检查成片','','','三个步骤沿阶梯依次抬升，连接箭头先于下一个步骤出现，最后同时保持。'),
 ('correction-reveal','观点划除与重述','myth-fact-swap','myth','先看清使用条件','能预览，就能直接套用|还需要核对框架与素材依赖','','','旧观点停留后被一条线划除并降低亮度，新观点从下方进入并保持可读。'),
 ('milestone-rail','阶段轨道点亮','timeline-scan','timeline','一条内容的制作过程','准备|制作|检查','','','横向轨道被逐段描出，三个节点依次点亮，标签在节点到达时揭示。'),
 ('cause-relay','因果接力图','cause-chain','cause','为什么复用需要参数','内容会变化|将内容与动画分开|复用同一段动作','','','原因、机制、结果顺序出现，箭头沿传播方向生长；每个节点有独立阅读停顿。'),
 ('option-balance','方案等权展开','mode-choice-compare','choice','按目标选择工作方式','直接使用模板|重新设计动效','','','两个等宽区域同时进入，说明随后显现，不暗示未经证实的优劣。'),
 ('feedback-circuit','四步反馈回路','iteration-loop','loop','让每次检查都有去处','观察|定位|修改|复验','','','四个节点按环路依次点亮，末尾的回程线连接起点，表达有限的一轮迭代。'),
]
COVERED = {
 'number-counter': ('count-up','已有数值递增和落定强调'),
 'metric-pulse': ('count-up','单项数字落定强调已有对应能力'),
 'big-number-card': ('count-up','大数字与说明可通过现有数字模板布局实现'),
 'compact-number-callout': ('count-up','数字强调已有；尺寸变化不另计一种效果'),
 'key-point-marker': ('hw-underline','已有原文下划线与重点标记'),
 'checklist-pop': ('marker-checklist-card','已有清单逐项出现和勾选'),
}

def dump(path, value):
 path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def main():
 BASE.mkdir(parents=True, exist_ok=True)
 candidates=[]; mapping=[]
 for slug,title,reference,kind,headline,labels,values,unit,description in SPECS:
  folder=BASE/slug; folder.mkdir(exist_ok=True)
  defaults={'title':headline,'labels':labels,'values':values,'unit':unit,
            'note':'演示数据，非实测结果' if values else '使用时替换为已确认的项目内容',
            'accent':'#176957','background':'#f3eee3','transparent':False,'focus':2,
            'explanation':'变化发生在这里' if kind=='turn' else '','detailA':'适合已有明确模板的需求','detailB':'适合需要独特表达的需求'}
  declarations=[{'id':k,'type':'boolean' if isinstance(v,bool) else 'number' if isinstance(v,int) else 'color' if k in ['accent','background'] else 'string','label':k,'default':v} for k,v in defaults.items()]
  config={'id':'atelier-'+slug,'kind':kind,'defaults':defaults}
  document=f'''<!doctype html>
<html lang="zh-CN" data-composition-variables='{html.escape(json.dumps(declarations,ensure_ascii=False),quote=True)}'>
<head><meta charset="utf-8"><meta name="viewport" content="width=960,height=540"><title>{title}</title>
<style>{(BASE/'theme.css').read_text()}</style><script src="gsap.min.js"></script></head>
<body><div id="scene" data-composition-id="atelier-{slug}" data-start="0" data-duration="6" data-width="960" data-height="540"><div id="paper"></div><div id="content"></div></div>
<script id="template-config" type="application/json">{json.dumps(config,ensure_ascii=False).replace('<','&lt;')}</script>
<script>{(BASE/'runtime.js').read_text()}</script></body></html>
'''
  (folder/'index.html').write_text(document)
  shutil.copyfile(ROOT/'assets/vendor/gsap-3.14.2.min.js',folder/'gsap.min.js')
  dump(folder/'default.json',defaults)
  dump(folder/'variables.json',declarations)
  # A real downloadable source bundle avoids opening a paused composition as
  # an apparently blank "source" page. Zip timestamps are fixed for reproducibility.
  with zipfile.ZipFile(folder/'template.zip','w',compression=zipfile.ZIP_DEFLATED) as archive:
   for filename in ['index.html','gsap.min.js','default.json','variables.json','LICENSE']:
    payload=(BASE/'LICENSE' if filename=='LICENSE' else folder/filename).read_bytes()
    info=zipfile.ZipInfo(filename,(2026,9,11,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
    archive.writestr(info,payload)
   info=zipfile.ZipInfo('README.md',(2026,9,11,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
   archive.writestr(info,f'# {title}\n\nAtelier 自制参数化 HyperFrames 模板。\n\n修改 default.json 后，在此目录运行：\n\n```sh\nnpx hyperframes check .\nnpx hyperframes render . --variables-file default.json --strict-variables --output result.mp4\n```\n\n默认数字仅为演示，替换为已确认的材料。形式参考 {REFERENCE}，不含该仓库源码、文案或媒体。模板代码见 LICENSE，GSAP 保留其文件头许可。\n')
  rel=str(folder.relative_to(ROOT))
  candidates.append({'id':'atelier-'+slug,'title':title,'en':slug,'category':'信息提示','origin':'atelier',
   'sourceLabel':'HyperFrames · Atelier 自制','compatibility':'HyperFrames 原生 · 本地模板','type':'hyperframes:composition',
   'desc':description,'use':'数据说明、知识讲解与教程；沿用真实材料，按旁白节奏安排出现。',
   'tags':['自制','Atelier','知识讲解','参数化',kind], 'duration':6,'poster':rel+'/poster.jpg','videoPreview':rel+'/preview.mp4',
   'source':rel+'/template.zip','page':'assets/atelier/knowledge/README.md','install':'下载并解压模板包（内含 index.html、gsap.min.js、default.json），按 default.json 修改参数，用 HyperFrames 的 --variables-file 渲染。',
   'previewLabel':'自制实渲','usageStatus':'自制模板','hoverStart':.6,
   'previewNote':'Atelier 独立编写的 HTML / SVG / GSAP 模板与样片。形式参考 nutllwhy/hyperframes-motion-library；未使用对方模板源码、文案或媒体。MP4 为不透明预览，透明导出需选择支持 alpha 的格式并核验。',
   'usageCaveat':'这是本地模板，不在官方 registry 中。不得使用 hyperframes add 安装。只替换已确认的文字、数据与颜色；默认数字是示例。'+(' focus 为从 0 开始的节点序号，explanation 为拐点解释。' if kind=='turn' else ''),
   'provenance':{'version':'atelier-knowledge-v1','license':'MIT','reference':REFERENCE,'referenceCommit':REF_SHA,'referenceTemplate':reference,'implementation':'independently-authored'}})
  mapping.append({'referenceId':reference,'decision':'independent-implementation','ourId':'atelier-'+slug,'difference':description})
 for ref,(our,reason) in COVERED.items(): mapping.append({'referenceId':ref,'decision':'existing-capability','ourId':our,'reason':reason})
 dump(ROOT/'data/atelier-candidates.json',candidates)
 dump(BASE/'reference-map.json',{'reference':REFERENCE,'commit':REF_SHA,'referenceTemplates':23,'createdTemplates':len(candidates),'existingCapabilities':len(COVERED),'items':mapping})
 print(f'Generated {len(candidates)} independent templates; mapped all 23 references.')

if __name__=='__main__':main()
