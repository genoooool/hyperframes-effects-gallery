"""Check generated page coverage, structured data, crawl paths and local resources."""
import json
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from build_search_pages import BASE, ROOT, effect_path


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.canonical = None
        self.h1 = 0
        self.schema = []
        self.in_schema = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a['href']
        if tag == 'a' and 'href' in a: self.links.append(a['href'])
        if tag in {'source', 'img'} and 'src' in a: self.links.append(a['src'])
        if tag == 'video' and 'poster' in a: self.links.append(a['poster'])
        if tag == 'link' and a.get('rel') == 'stylesheet': self.links.append(a['href'])
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_schema = True

    def handle_endtag(self, tag):
        if tag == 'script': self.in_schema = False

    def handle_data(self, text):
        if self.in_schema: self.schema.append(json.loads(text))


def main():
    data = json.loads((ROOT / 'data/gallery-effects.json').read_text())
    paths = ['catalog/'] + [effect_path(e) for e in data['effects']]
    sitemap = {e.text for e in ET.parse(ROOT / 'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
    assert sitemap == {BASE, *(BASE + p for p in paths)}
    directory = Page((ROOT / 'catalog/index.html').read_text())
    assert len(directory.schema[0]['mainEntity']['itemListElement']) == len(data['effects'])
    for path in paths:
        text = (ROOT / path / 'index.html').read_text()
        assert '/Users/' not in text and '"videoProvenance"' not in text
        page = Page(text)
        assert page.h1 == 1 and page.canonical == BASE + path and len(page.schema) == 1
        assert page.schema[0]['url'] == page.canonical
        for url in page.links:
            parts = urlsplit(url)
            if parts.netloc and parts.netloc != urlsplit(BASE).netloc: continue
            if not parts.path: continue
            target = ROOT / unquote(parts.path).lstrip('/')
            if parts.path.endswith('/'): target /= 'index.html'
            assert target.is_file(), (path, url)
    for e in data['effects']:
        assert '/' + effect_path(e) in directory.links
        text = (ROOT / effect_path(e) / 'index.html').read_text()
        assert e['id'] in text
        assert BASE + effect_path(e) in (ROOT / 'llms-full.txt').read_text()
    assert '/catalog/' in Page((ROOT / 'index.html').read_text()).links
    print(f'PASS {len(paths)} static pages, {len(sitemap)} sitemap URLs, internal links, JSON-LD and full-text coverage')


if __name__ == '__main__':
    main()
