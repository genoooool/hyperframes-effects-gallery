"""Shared download helpers; six-item bootstrap retained as historical metadata."""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import re
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
COMMIT = '7a2a6917367e6dd7ce22f4c321c4a852dcf58dfd'
BASE = f'https://raw.githubusercontent.com/heygen-com/hyperframes/{COMMIT}/'
ITEMS = [
    ('transitions-push', '推移转场', '转场', '官方转场组合示例，连续展示多种推入与滑动切换，观察前后画面如何交接。', '节奏剪辑 · 场景切换', '滑动 推入 转场组合'),
    ('transitions-scale', '缩放转场', '转场', '官方转场组合示例，连续展示多种放大与缩小切换，观察画面尺度变化。', '产品展示 · 章节切换', '缩放 推进 转场组合'),
    ('caption-kinetic-slam', '重击字幕', '字幕与标题', '单词占据画面中心，从交替方向快速进入，并用颜色突出重点词。', '重点强调 · 节奏字幕', '文字 卡点 标题'),
    ('caption-glitch-rgb', 'RGB 故障字幕', '字幕与标题', '文字叠加红绿蓝通道错位与扫描线，形成电子故障质感。', '科技包装 · 风格字幕', '文字 赛博 色差'),
    ('grain-overlay', '胶片颗粒', '画面特效', '官方示例展示动态颗粒叠加的质感，可覆盖在现有画面上。', '复古质感 · 氛围叠加', '胶片 噪点 纹理'),
    ('shimmer-sweep', '高光扫过', '画面特效', '一束高光扫过示例元素，让按钮、标题或图形短暂闪亮。', '产品强调 · 元素高光', '光影 扫光 闪亮'),
]

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'HyperframeAtelier/1.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(0.5)

def save(relative, data):
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return hashlib.sha256(data).hexdigest()

def collect(item):
    name, title, category, desc, use, tags = item
    kind = 'blocks' if name.startswith('transitions-') else 'components'
    def asset(relative, url):
        path = ROOT / relative
        if path.exists():
            return path.read_bytes()
        data = fetch(url)
        save(relative, data)
        return data
    preview_url = BASE + f'docs/public/catalog/{kind}/{name}.json'
    registry_url = BASE + f'registry/{kind}/{name}/registry-item.json'
    preview = asset(f'assets/official/{name}/preview.json', preview_url)
    registry = asset(f'assets/official/{name}/registry-item.json', registry_url)
    metadata = json.loads(registry)
    poster_url = metadata['preview']['poster']
    poster = asset(f'assets/official/{name}/poster.png', poster_url)
    if not poster.startswith(b'\x89PNG'):
        raise ValueError(f'{name}: poster is not PNG')
    preview_path = f'assets/official/{name}/preview.json'
    poster_path = f'assets/official/{name}/poster.png'
    hashes = {'preview': save(preview_path, preview), 'poster': save(poster_path, poster)}
    save(f'assets/official/{name}/registry-item.json', registry)
    sources = []
    for entry in metadata['files']:
        path = entry if isinstance(entry, str) else entry['path']
        source_url = BASE + f'registry/{kind}/{name}/{path}'
        local_path = f'assets/official/{name}/source/{path}'
        payload = asset(local_path, source_url)
        hashes[path] = save(local_path, payload)
        sources.append({'path': local_path, 'url': source_url})
    html = json.loads(preview)['html']
    durations = re.findall(r'data-duration=[\"\']([\d.]+)', html)
    result = dict(id=name, title=title, en=metadata['title'], category=category, desc=desc,
                  use=use, tags=tags, duration=float(durations[0]) if durations else None,
                  type=metadata['type'], preview=preview_path, poster=poster_path,
                  page=f'https://hyperframes.heygen.com/catalog/{kind}/{name}',
                  source=f'https://github.com/heygen-com/hyperframes/tree/{COMMIT}/registry/{kind}/{name}',
                  install=f'npx hyperframes add {name}', sources=sources,
                  provenance={'commit':COMMIT,'preview_url':preview_url,'poster_url':poster_url,'sha256':hashes})
    print(name, 'collected', flush=True)
    return result

if __name__ == '__main__':
    raise SystemExit('Use expand_official.py, then finalize_collection.py. The old six-item bootstrap is retired.')
