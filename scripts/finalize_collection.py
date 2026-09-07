"""Publish only complete, locally playable transition/caption records."""
import hashlib
import base64
import json
import pathlib
import re
import subprocess
from collect_official import ROOT

DESCRIPTIONS = {
    'transitions-blur':'利用运动模糊与失焦衔接镜头，官方组合示例展示多种模糊方式。',
    'transitions-cover':'新画面从边缘遮盖旧画面，包含不同方向的覆盖与揭开。',
    'transitions-grid':'把画面拆成网格，通过分块切换完成转场。',
    'transitions-push':'前后画面同步推移，包含横向、纵向与带回弹的切换。',
    'transitions-scale':'通过放大穿越或缩小退场，把一个画面交接给下一个画面。',
    'transitions-3d':'利用透视、翻转与旋转制造立体的画面交接。',
    'transitions-dissolve':'用渐隐、叠化与溶解自然地交接两个画面。',
    'transitions-distortion':'让画面发生拉伸、扭曲和形变，再进入下一镜。',
    'transitions-destruction':'画面以破碎、拆散等方式退场，露出下一镜。',
    'transitions-light':'利用闪光与亮度变化完成镜头切换，包含多种光效变体。',
    'transitions-mechanical':'模拟快门、机械分片与开合的切换方式。',
    'transitions-radial':'从中心或圆形边界向外揭开下一画面。',
    'transitions-other':'官方收录的其他创意切换方式，包含多个转场变体。',
    'flash-through-white':'两镜之间短暂闪白，以高亮过渡掩盖切点。',
    'glitch':'以数字故障、画面错位和扰动衔接两个镜头。',
    'light-leak':'模拟镜头漏光，让彩色光晕经过画面完成切换。',
    'whip-pan':'模拟快速甩动镜头，借助横向运动感完成切换。',
    'swirl-vortex':'画面围绕中心旋转、卷入漩涡并切换到下一镜。',
    'ripple-waves':'波纹穿过画面边界，把旧画面逐步替换为新画面。',
    'cinematic-zoom':'以镜头推进和缩放制造有速度感的画面交接。',
    'chromatic-radial-split':'沿径向分离颜色通道，形成色差扩散转场。',
    'cross-warp-morph':'两幅画面在交叉扭曲中进行形变衔接。',
    'domain-warp-dissolve':'以不规则的噪声形变溶解旧画面，露出下一镜。',
    'gravitational-lens':'模拟引力透镜对画面的弯曲和聚拢，形成空间扭曲切换。',
    'ridged-burn':'沿起伏的纹理边缘逐步燃烧、揭开下一画面。',
    'sdf-iris':'以可变化的光圈边界开合，完成画面揭示。',
    'thermal-distortion':'模拟热浪造成的空气折射，让画面在扭曲中交接。',
    'grid-pixelate-wipe':'网格方块依次消退，在前后画面之间形成像素化擦除。',
    'caption-clip-wipe':'每个词从左向右擦入，跟随字幕节奏逐步显现。',
    'caption-editorial-emphasis':'用不同字体与明显的字号对比，强调句子中的重点词。',
    'caption-emoji-pop':'在字幕中配合表情符号与挤压弹出动作，增强口语表达。',
    'caption-glitch-rgb':'文字叠加 RGB 通道错位与扫描线，形成电子故障质感。',
    'caption-gradient-fill':'文字使用渐变填色，并以弹性动作进入画面。',
    'caption-highlight':'活动词后方出现红色底色，随说话节奏逐词移动。',
    'caption-kinetic-slam':'单词依次占据画面中心，从交替方向快速进入，突出语言节奏。',
    'caption-matrix-decode':'字符先打乱，再逐步解码成清晰的字幕内容。',
    'caption-neon-accent':'用多色霓虹光晕和轻微摆动突出字幕。',
    'caption-neon-glow':'青色与洋红色霓虹发光，重点词使用不同强调色。',
    'caption-parallax-layers':'用视差、层次和文字拉伸，让字幕带有空间感。',
    'caption-particle-burst':'关键词出现时触发彩色粒子爆发，强调关键表达。',
    'caption-pill-karaoke':'字幕放在胶囊容器中，逐词高亮形成卡拉 OK 阅读效果。',
    'caption-weight-shift':'通过字体粗细变化，把阅读注意力引向当前字幕。',
    'caption-camera-follow':'单词不断写入更大的空间，镜头持续拉远跟随，最终展示整句。',
}


def main():
    path = ROOT/'data/official-candidates.json'
    effects = json.loads(path.read_text())
    for e in effects:
        folder = pathlib.Path(e['preview']).parent
        if not e.get('videoPreview'):
            video = ROOT/folder/'preview.mp4'
            if not video.exists():
                html = json.loads((ROOT/e['preview']).read_text())['html']
                html = html.replace('https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js', 'assets/vendor/gsap-3.14.2.min.js')
                def materialize(match):
                    child = folder/'preview-child.html'
                    (ROOT/child).write_bytes(base64.b64decode(match[1]))
                    return f'data-composition-src="{child}"'
                html = re.sub(r'data-composition-src="data:text/html;base64,([^"]+)"', materialize, html)
                source = folder/'render.html'
                (ROOT/source).write_text(html)
                subprocess.run(['npx','--no-install','hyperframes','render',str(ROOT),'-c',str(source),'-o',str(video),
                                '--fps','30','--quality','standard','--workers','1'],cwd=ROOT,check=True)
            e['videoPreview'] = str(video.relative_to(ROOT))
            e['videoProvenance'] = {'kind':'locally-rendered-official-preview', 'renderer':'hyperframes@0.8.30',
                'officialPreviewSha256':hashlib.sha256((ROOT/e['preview']).read_bytes()).hexdigest(),
                'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'bytes':video.stat().st_size}
        video = ROOT/e['videoPreview']
        probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(video)]))
        e['duration'] = float(probe['format']['duration'])
        if not e.get('poster'):
            poster = ROOT/folder/'poster.jpg'
            if not poster.exists(): subprocess.run(['ffmpeg','-v','error','-ss',str(min(1.2,e['duration']/2)),'-i',str(video),'-frames:v','1',str(poster)],check=True)
            e['poster'] = str(poster.relative_to(ROOT))
        e['sourceDescription'] = e['desc']
        e['desc'] = DESCRIPTIONS[e['id']]
        if e['id'] == 'grid-pixelate-wipe': e['use'] = '场景衔接 · 像素转场'
        if not e['id'].startswith('transitions-'): e.pop('hoverStart', None)
        e.pop('mediaIssue',None)
        e.pop('posterIssue',None)
    current = ROOT/'data/official-effects.json'
    archive = ROOT/'data/archived-effects.json'
    if not archive.exists():
        archive.write_text(json.dumps([e for e in json.loads(current.read_text()) if e['id'] not in {i['id'] for i in effects}],ensure_ascii=False,indent=2))
    current.write_text(json.dumps(effects,ensure_ascii=False,indent=2))
    print(f'Published {len(effects)} official effects.')


if __name__=='__main__':main()
