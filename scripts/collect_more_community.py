"""Collect selected atomic effects, keeping original families and provenance."""
import concurrent.futures
import hashlib
import json
import subprocess
from collect_official import ROOT, fetch

ALI = {
    'horizontal-push': '惯性横推', 'circular-iris': '发光光圈', 'diagonal-slices': '斜向切片',
    'pixel-dissolve': '像素格溶解', 'clock-wipe': '时钟扫描', 'luma-sweep': '亮光扫切',
    'zoom-through': '穿越变焦', 'venetian-blinds': '立体百叶', 'shatter-panels': '碎片飞散',
    'liquid-bars': '液态条带', 'high-contrast-captions': '高对比描边字幕',
    'speaker-captions': '说话人字幕', 'karaoke-captions': '逐词填色字幕',
    'caption-box': '多行字幕框', 'caption-highlight': '词块高亮字幕', 'large-type-captions': '大字易读字幕',
}
THEMES = {'pop':'弹性弹出字幕','karaoke':'流动高亮字幕','kinetic-01':'空间排布字幕 01','kinetic-02':'空间排布字幕 02',
          'hustle':'节奏冲击字幕','grape':'圆角色块字幕','beast':'粗体描边字幕','poppin':'醒目大写字幕',
          'aarit':'渐变逐字字幕','soft-ai':'柔焦玻璃字幕','gaming-stream':'电竞发光字幕','simple-one-word':'单词聚焦字幕','podcast':'播客强调字幕'}
KIT = {'KaraokeFill':'逐词填色','KineticSlam':'重击逐词','PillKaraoke':'胶囊逐词','WeightShift':'字重聚焦','NeonGlow':'霓虹余辉','EditorialEmphasis':'下划线跟读'}


def pinned(repo):
    return json.loads((ROOT/'data/research'/(repo.replace('/','--')+'.json')).read_text())['sha']


def hashes(folder):
    return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.rglob('*') if p.is_file() and p.suffix in ['.ts','.tsx','.js','.json']}


def collect_ali():
    repo='ali-abassi/remotion-templates';commit=pinned(repo);base=ROOT/'assets/community/ali-remotion-templates';base.mkdir(parents=True,exist_ok=True)
    paths=['README.md','package.json','src/lib/primitives.tsx','src/lib/types.ts']
    for family in ['transitions','accessibility-captions']:
        paths.extend([f'src/families/{family}.tsx',f'src/families/{family}.registry.json'])
    for name in paths:
        p=base/name;p.parent.mkdir(parents=True,exist_ok=True)
        if not p.exists():p.write_bytes(fetch(f'https://raw.githubusercontent.com/{repo}/{commit}/{name}'))
    records=[]
    for family in ['transitions','accessibility-captions']:
        for entry in json.loads((base/f'src/families/{family}.registry.json').read_text()):
            if entry['defaultProps']['variant'] in ALI:records.append((family,entry))
    def collect(pair):
        family,entry=pair;name=entry['id'];folder=base/name;folder.mkdir(exist_ok=True)
        video=folder/'preview.mp4';poster=folder/'poster.jpg'
        url=f'https://raw.githubusercontent.com/{repo}/{commit}/site/previews/{name}.mp4'
        if not video.exists():video.write_bytes(fetch(url))
        if not poster.exists():subprocess.run(['ffmpeg','-v','error','-ss','1','-i',str(video),'-frames:v','1',str(poster)],check=True)
        (folder/'preset.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2))
        duration=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(video)]))['format']['duration'])
        print('AUTHOR READY',name,flush=True)
        return {'id':'ali-'+name,'title':ALI[entry['defaultProps']['variant']], 'en':entry['title'],
                'category':'转场' if family=='transitions' else '字幕','origin':'remotion','sourceLabel':'Remotion · ali-abassi',
                'compatibility':'Remotion 家族预设 · 待适配','type':'remotion:family-preset',
                'desc':entry['description'],'use':'镜头衔接' if family=='transitions' else '口播字幕 · 无障碍阅读',
                'tags':' '.join(entry['tags'])+' '+family,'duration':duration,'poster':str(poster.relative_to(ROOT)),
                'videoPreview':str(video.relative_to(ROOT)),'previewLabel':'作者示例','page':f'https://github.com/{repo}',
                'source':f'https://github.com/{repo}/blob/{commit}/src/families/{family}.tsx',
                'install':f'读取原仓库 src/families/{family}.tsx、对应 registry 和 src/lib/ 依赖；使用预设 {name}。这不是独立 npm 包。仓库根目录未提供明确许可证，正式复用前核对作者授权与第三方来源要求。',
                'defaultProps':entry['defaultProps'],'sources':[{'path':str((base/f'src/families/{family}.tsx').relative_to(ROOT))}],
                'provenance':{'commit':commit,'license':'未声明；需核对来源授权','family':family,'files':hashes(base/'src')},
                'videoProvenance':{'kind':'author-video','url':url,'sha256':hashlib.sha256(video.read_bytes()).hexdigest()},
                'previewNote':'作者原始视频；这是共享 React 家族引擎下的一个预设，尚未转换为 HyperFrames。仓库根目录无明确 LICENSE，复用时需核对来源授权。'}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:items=list(pool.map(collect,records))
    (ROOT/'data/ali-effects.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))


def native_candidates():
    items=[]
    for repo,prefix,names in [('vshukla7/remotion-captions-themes','themes',THEMES),('Fats403/remotion-captions-kit','kit',KIT)]:
        commit=pinned(repo);base=ROOT/'assets/community'/repo.split('/')[1]
        for name,title in names.items():
            slug=name if prefix=='themes' else ''.join('-'+c.lower() if c.isupper() else c for c in name).lstrip('-')
            folder=base/'previews'/name;folder.mkdir(parents=True,exist_ok=True)
            file=f'src/themes/{name}.tsx' if prefix=='themes' else f'src/presets/{slug}.tsx'
            assert (base/file).exists(),file
            install='npm install '+repo.split('/')[1]+'\n'+(f'import {{ CaptionTheme }} from "remotion-captions-themes"; 使用 theme="{name}"，传入 data.lines[].words（text/start/end，时间单位秒）。' if prefix=='themes' else f'import {{ {name}, CaptionTrack, captionsFromWords, createCaptionPages }} from "remotion-captions-kit"; 使用真实逐词时间创建字幕页并渲染 {name}。')
            items.append({'id':prefix+'-'+slug,'title':title,'en':name,'category':'字幕','origin':'remotion',
                'sourceLabel':'Remotion · '+repo.split('/')[0],'compatibility':'Remotion 原生 · 待适配','type':'remotion:component',
                'desc':f'{title}。使用原始 React 组件与逐词时间轴渲染，展示朗读时的文字变化。',
                'use':'口播字幕 · 逐词强调','tags':f'字幕 {name} {title} {repo}',
                'duration':4,'poster':str((folder/'poster.jpg').relative_to(ROOT)), 'videoPreview':str((folder/'preview.mp4').relative_to(ROOT)),
                'previewLabel':'源码实渲','page':f'https://github.com/{repo}#readme','source':f'https://github.com/{repo}/blob/{commit}/{file}',
                'install':install,'sources':[{'path':str((base/file).relative_to(ROOT))}],
                'renderProps':{'library':prefix,'variant':name},
                'provenance':{'commit':commit,'license':'MIT','files':hashes(base/'src')},
                'videoProvenance':{'kind':'locally-rendered-original-react','renderer':'tools/community-render','fps':24},
                'previewNote':'使用原始 React 组件在 Remotion Player 中逐帧渲染，示例文字和时间由本库提供。按作者字体栈使用本机可用字体；未转换为 HyperFrames。'})
    (ROOT/'data/native-caption-candidates.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
    print(len(items),'native caption candidates')


if __name__=='__main__':
    native_candidates()
    collect_ali()
