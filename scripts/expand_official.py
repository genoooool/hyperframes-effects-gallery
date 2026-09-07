"""Collect the requested official transitions and caption styles into staging."""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import subprocess
from collect_official import BASE, COMMIT, ROOT, fetch

TRANSITIONS = {
    'transitions-blur': '模糊转场', 'transitions-cover': '遮盖转场',
    'transitions-grid': '网格转场', 'transitions-push': '推移转场',
    'transitions-scale': '缩放转场', 'transitions-3d': '立体转场',
    'transitions-dissolve': '溶解转场', 'transitions-distortion': '扭曲转场',
    'transitions-destruction': '破碎转场', 'transitions-light': '光效转场',
    'transitions-mechanical': '机械转场', 'transitions-radial': '径向转场',
    'transitions-other': '创意转场', 'flash-through-white': '闪白切换',
    'glitch': '故障切换', 'light-leak': '漏光切换', 'whip-pan': '甩镜切换',
    'swirl-vortex': '旋涡转场', 'ripple-waves': '波纹转场',
    'cinematic-zoom': '电影感推进', 'chromatic-radial-split': '径向色差',
    'cross-warp-morph': '交叉形变', 'domain-warp-dissolve': '流体溶解',
    'gravitational-lens': '引力透镜', 'ridged-burn': '纹理燃烧',
    'sdf-iris': '光圈开合', 'thermal-distortion': '热浪扭曲',
    'grid-pixelate-wipe': '像素网格擦除',
}
CAPTIONS = {
    'caption-clip-wipe': '逐词擦入', 'caption-editorial-emphasis': '重点词强调',
    'caption-emoji-pop': '表情弹出字幕', 'caption-glitch-rgb': 'RGB 故障字幕',
    'caption-gradient-fill': '渐变弹性字幕', 'caption-highlight': '逐词底色高亮',
    'caption-kinetic-slam': '重击字幕', 'caption-matrix-decode': '字符解码字幕',
    'caption-neon-accent': '多彩霓虹字幕', 'caption-neon-glow': '霓虹发光字幕',
    'caption-parallax-layers': '视差层叠字幕', 'caption-particle-burst': '关键词粒子字幕',
    'caption-pill-karaoke': '胶囊卡拉 OK 字幕', 'caption-weight-shift': '字重变化字幕',
    'caption-camera-follow': '镜头跟随字幕',
}
# Text texture and blend-difference are decorative text treatments, not spoken
# caption sequences. They stay outside this subtitle-only collection.
OLD = {e['id']: e for e in json.loads((ROOT / 'data/official-effects.json').read_text())}


def asset(path, url):
    path = ROOT / path
    if not path.exists():
        data = fetch(url)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return path.read_bytes()


def collect(pair):
    name, title = pair
    kind = 'blocks' if name in TRANSITIONS and name != 'grid-pixelate-wipe' else 'components'
    prefix = f'assets/official/{name}/'
    metadata = json.loads(asset(prefix + 'registry-item.json', BASE + f'registry/{kind}/{name}/registry-item.json'))
    preview_url = BASE + f'docs/public/catalog/{kind}/{name}.json'
    preview = asset(prefix + 'preview.json', preview_url)
    html = json.loads(preview)['html']
    sources, hashes = [], {'preview': hashlib.sha256(preview).hexdigest()}
    for f in metadata['files']:
        p = f if isinstance(f, str) else f['path']
        url = BASE + f'registry/{kind}/{name}/{p}'
        payload = asset(prefix + 'source/' + p, url)
        hashes[p] = hashlib.sha256(payload).hexdigest()
        sources.append({'path': prefix + 'source/' + p, 'url': url})
    old = OLD.get(name, {})
    e = dict(old, id=name, title=title, en=metadata['title'], category='转场' if name in TRANSITIONS else '字幕',
             sourceLabel='HyperFrames 官方', origin='official', compatibility='HyperFrames 原生',
             type=metadata['type'], tags=' '.join(metadata['tags']),
             desc=metadata['description'], use='场景衔接 · 镜头切换' if kind == 'blocks' else '口播字幕 · 逐词强调',
             duration=float(re.search(r'data-duration=[\"\']([\d.]+)', html)[1]),
             page=f'https://hyperframes.heygen.com/catalog/{kind}/{name}',
             source=f'https://github.com/heygen-com/hyperframes/tree/{COMMIT}/registry/{kind}/{name}',
             install=f'npx hyperframes add {name}', sources=sources, preview=prefix+'preview.json',
             provenance={'commit': COMMIT, 'preview_url': preview_url, 'sha256': hashes})
    e['previewNote'] = '官方转场组合演示，包含多个变体。' if name.startswith('transitions-') else '官方原始效果示例。'
    video = metadata.get('preview', {}).get('video')
    if not e.get('videoPreview') and video:
        try:
            payload = asset(prefix + 'preview.mp4', video)
            info = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(ROOT/prefix/'preview.mp4')]))
            e['duration'] = float(info['format']['duration'])
            e['videoPreview'] = prefix + 'preview.mp4'
            e['videoProvenance'] = {'kind':'official-video', 'url': video, 'sha256':hashlib.sha256(payload).hexdigest(), 'bytes':len(payload)}
        except Exception as error:
            e['mediaIssue'] = str(error)
    poster_url = metadata.get('preview', {}).get('poster')
    if poster_url:
        try:
            payload = asset(prefix+'poster.png', poster_url)
            if not payload.startswith(b'\x89PNG'): raise ValueError('Invalid PNG')
            e['poster'] = prefix+'poster.png'
            e['provenance']['sha256']['poster'] = hashlib.sha256(payload).hexdigest()
        except Exception as error:
            e['posterIssue'] = str(error)
    if name.startswith('transitions-'): e['hoverStart'] = 4.25
    print(name, 'VIDEO' if e.get('videoPreview') else 'NEEDS RENDER', flush=True)
    return e


if __name__ == '__main__':
    results, errors = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        tasks = {pool.submit(collect, p): p[0] for p in {**TRANSITIONS, **CAPTIONS}.items()}
        for task in concurrent.futures.as_completed(tasks):
            try: results.append(task.result())
            except Exception as error: errors.append({'id': tasks[task], 'error': str(error)})
    order = list(TRANSITIONS) + list(CAPTIONS)
    results.sort(key=lambda e: order.index(e['id']))
    (ROOT/'data/official-candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    (ROOT/'data/research/official-collection-issues.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
    print(f'Collected {len(results)}; errors: {errors}', flush=True)
