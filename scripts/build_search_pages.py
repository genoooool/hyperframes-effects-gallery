"""Generate crawlable pages from the same catalog used by the interactive gallery."""
import html
import json
import re
from pathlib import Path
from urllib.parse import quote, urljoin

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://77654321.xyz/'
CATEGORIES = ['转场', '字幕', '镜头运动', '局部强调', '素材展示', '节奏与情绪', '信息提示', '画面质感']
FAQ = [
    ('这个动效库提供什么？', '这里汇集视频转场、动态字幕、镜头运动、局部强调、素材展示、节奏与情绪、信息提示和画面质感。每个效果提供预览、用途说明、来源和接入状态。'),
    ('所有效果都能直接用于 HyperFrames 吗？', '不能。HyperFrames 官方模板按原有安装方式使用；Atelier 自制模板下载后本地渲染。Remotion、GLSL 和 Web 效果需相应宿主或适配，能播放预览不代表已经适配。'),
    ('Atelier 自制模板怎么使用？', '在效果详情页下载模板包，解压后修改 default.json 中的文案、标签、数值和颜色，再用 HyperFrames 渲染。现有 MP4 是不透明预览，透明输出需要另行验证。'),
    ('预览素材可以直接商用吗？', '按每项原始许可证和素材权利分别判断。本库保留来源与许可说明，不对全部效果作统一商用授权。演示文案、品牌和数据应换成自己的已确认材料。'),
]


def esc(value):
    return html.escape(str(value), quote=True)


def effect_path(effect):
    key = effect['id']
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', key):
        raise ValueError('Unsafe effect id: ' + key)
    return 'effects/' + key + '/'


def absolute(value):
    url = urljoin(BASE, str(value))
    if not url.startswith(('https://', 'http://')):
        raise ValueError('Unsupported URL')
    return url


def link(url, label):
    return f'<a href="{esc(site_ref(url))}">{esc(label)}</a>'


def site_ref(url):
    return '/' + url[len(BASE):] if url.startswith(BASE) else url


def page(title, description, path, body, entity):
    url = BASE + path
    schema = {'@context': 'https://schema.org', '@type': 'CollectionPage' if path == 'catalog/' else 'WebPage',
              'name': title, 'description': description, 'url': url, 'inLanguage': 'zh-CN', 'mainEntity': entity}
    encoded = json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)} · HyperFrames 动效库</title><meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(url)}"><link rel="stylesheet" href="/search-pages.css">
<link rel="describedby" href="/llms.txt" type="text/markdown">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{esc(url)}">
<meta property="og:image" content="{BASE}docs/images/gallery-overview.jpg">
<script type="application/ld+json">{encoded}</script></head>
<body><header><a href="/">HyperFrames <span>动效库</span></a><nav aria-label="页面导航"><a href="/#library">交互展厅</a><a href="/catalog/">完整目录</a></nav></header>
<main>{body}</main><footer><a href="https://github.com/genoooool/hyperframes-effects-gallery">GitHub 源码</a> · <a href="/THIRD_PARTY_NOTICES.md">来源与许可说明</a> · <a href="/llms-full.txt">完整文字资料</a></footer></body></html>
'''


def main():
    catalog = json.loads((ROOT / 'data/gallery-effects.json').read_text())
    effects = catalog['effects']
    ids = [e['id'] for e in effects]
    assert len(ids) == len(set(ids)) and all(e['category'] in CATEGORIES for e in effects)
    outputs = {}
    full = ['# HyperFrames 动效与字幕效果库', f'主站：{BASE}',
            f'共 {len(effects)} 个主效果、{catalog["rawCount"]} 个来源版本。保留实际接入状态，预览不等于已经适配。',
            '以下是与网页一致的完整文字目录；示例数据不代表实测事实。']
    sections = []
    for i, category in enumerate(CATEGORIES):
        group = [e for e in effects if e['category'] == category]
        rows = ''.join(f'<li>{link("/" + effect_path(e), e["title"])}<p>{esc(e["desc"])}</p><small>{esc(e["sourceLabel"])} · {esc(e["compatibility"])}</small></li>' for e in group)
        sections.append(f'<section id="category-{i}"><h2>{esc(category)} <small>{len(group)} 个</small></h2><ul class="effect-list">{rows}</ul></section>')
    toc = ' '.join(link(f'#category-{i}', c) for i, c in enumerate(CATEGORIES))
    faq = ''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in FAQ)
    summary = f'{len(effects)} 个视频动效，涵盖转场、字幕、镜头运动与知识图解；含真实预览、来源和接入说明。'
    body = f'<p class="eyebrow">EFFECTS INDEX</p><h1>视频动效完整目录</h1><p class="lead">{summary}</p><p>共 {catalog["rawCount"]} 个来源版本；同组版本保留在各效果页。{link("/#library", "进入交互展厅，按风格筛选和收藏 →")}</p><nav class="category-nav" aria-label="效果分类">{toc}</nav><section><h2>使用前了解</h2>{faq}</section>' + ''.join(sections)
    entity = {'@type': 'ItemList', 'numberOfItems': len(effects), 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': e['title'], 'url': BASE + effect_path(e)} for i, e in enumerate(effects)]}
    outputs['catalog/index.html'] = page('视频动效完整目录', summary, 'catalog/', body, entity)
    for e in effects:
        path = effect_path(e)
        source = absolute(e['source'])
        preview = absolute(e['videoPreview'])
        poster = absolute(e['poster'])
        provenance = e.get('provenance', {})
        version = provenance.get('version') or provenance.get('commit') or '见原始来源'
        license_name = provenance.get('license') or '请核对原始来源的许可'
        alternatives = ''.join(f'<li><strong>{esc(a["title"])}</strong> · {esc(a["sourceLabel"])} · {esc(a["compatibility"])} — {link(absolute(a["page"]), "原始说明")} / {link(absolute(a["source"]), "源码")}</li>' for a in e.get('alternatives', []))
        related = [r for r in effects if r['category'] == e['category'] and r['id'] != e['id']][:4]
        related_html = ''.join(f'<li>{link("/" + effect_path(r), r["title"])}</li>' for r in related)
        description = f'{e["title"]}：{e["desc"]} 来源：{e["sourceLabel"]}。{e["compatibility"]}。'
        body = f'''<nav class="breadcrumbs" aria-label="当前位置">{link('/catalog/', '完整目录')} / {link('/catalog/#category-' + str(CATEGORIES.index(e['category'])), e['category'])}</nav>
<p class="eyebrow">{esc(e['en'])}</p><h1>{esc(e['title'])}</h1><p class="lead">{esc(e['desc'])}</p>
<p class="status">{esc(e['sourceLabel'])} · {esc(e['compatibility'])}</p>
<video controls playsinline preload="none" poster="{esc(site_ref(poster))}" aria-label="{esc(e['title'])}效果预览"><source src="{esc(site_ref(preview))}" type="video/mp4">{link(preview, '打开视频预览')}</video>
<p>{esc(e.get('previewLabel', '效果预览'))} · {esc(e['duration'])} 秒</p>
<section><h2>适合用在哪里</h2><p>{esc(e['use'])}</p></section>
<section><h2>如何使用</h2><p>{esc(e.get('install', '请查看原始来源说明。'))}</p><p class="actions">{link(source, '下载模板包' if e['origin'] == 'atelier' else '查看模板源码')} {link(absolute(e['page']), '查看使用说明')} {link('/?effect=' + quote(e['id']) + '#library', '在展厅中预览与收藏')}</p><p>{esc(e.get('usageCaveat', ''))}</p><p>{esc(e.get('previewNote', ''))}</p></section>
<section><h2>来源与许可</h2><dl><dt>来源</dt><dd>{esc(e['sourceLabel'])}</dd><dt>版本</dt><dd>{esc(version)}</dd><dt>许可记录</dt><dd>{esc(license_name)}</dd></dl><p>示例中的文字、品牌、图片与数据应按实际项目替换。{link('/THIRD_PARTY_NOTICES.md', '阅读完整来源与许可说明')}</p></section>
{('<section><h2>同组来源版本</h2><ul>' + alternatives + '</ul></section>') if alternatives else ''}
<section><h2>同类效果</h2><ul>{related_html}</ul></section>'''
        entity = {'@type': 'CreativeWork', 'name': e['title'], 'alternateName': e['en'], 'description': e['desc'],
                  'url': BASE + path, 'image': poster, 'genre': e['category'], 'isBasedOn': absolute(e['page'])}
        outputs[path + 'index.html'] = page(e['title'], description, path, body, entity)
        full.extend([f'\n## {e["title"]} / {e["en"]}', BASE + path, e['desc'],
                     f'分类：{e["category"]}；来源：{e["sourceLabel"]}；接入：{e["compatibility"]}',
                     '用途：' + e['use'], '使用：' + e.get('install', ''), '源码：' + source,
                     '版本：' + str(version), '许可：' + str(license_name), e.get('previewNote', '')])
        for a in e.get('alternatives', []):
            full.append(f'同组版本：{a["title"]}；{a["compatibility"]}；源码：{absolute(a["source"])}')
    urls = [BASE, BASE + 'catalog/'] + [BASE + effect_path(e) for e in effects]
    outputs['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('<url><loc>' + esc(url) + '</loc></url>\n' for url in urls) + '</urlset>\n'
    outputs['llms-full.txt'] = '\n\n'.join(full) + '\n'
    outputs['404.html'] = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="robots" content="noindex"><title>页面不存在</title><h1>这个页面不存在</h1><p><a href="/catalog/">返回完整动效目录</a></p></html>\n'
    for name, content in outputs.items():
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
    print(f'Generated {len(effects)} effect pages, catalog, {len(urls)} sitemap URLs and full text.')


if __name__ == '__main__':
    main()
