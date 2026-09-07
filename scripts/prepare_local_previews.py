"""Localize dependencies without altering the official animation code or originals."""
import base64
import hashlib
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
VENDOR = ROOT / 'assets/vendor'
GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'
DEPENDENCIES = {
    'gsap-3.14.2.min.js': GSAP,
    'hyperframe.runtime-0.8.30.iife.js': 'https://cdn.jsdelivr.net/npm/@hyperframes/core@0.8.30/dist/hyperframe.runtime.iife.js',
    'anton.css': 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
    'space-grotesk.css': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap',
}

def dependency(name, url):
    path = VENDOR / name
    if not path.exists():
        for attempt in range(3):
            try:
                request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(request, timeout=20) as response:
                    path.write_bytes(response.read())
                break
            except Exception:
                if attempt == 2:
                    raise
    return path.read_bytes()

def compile_previews():
    VENDOR.mkdir(parents=True, exist_ok=True)
    for name, url in DEPENDENCIES.items():
        dependency(name, url)
    font_css = {}
    font_dependencies = {}
    for name in ['anton', 'space-grotesk']:
        css = (VENDOR / f'{name}.css').read_text()
        for index, url in enumerate(re.findall(r'url\((https://[^)]+)\)', css)):
            filename = f'{name}-{index}.ttf'
            encoded = base64.b64encode(dependency(filename, url)).decode()
            font_dependencies[filename] = url
            css = css.replace(url, f'data:font/ttf;base64,{encoded}')
        font_css[name] = css
    manifest_path = ROOT / 'data/official-effects.json'
    manifest = json.loads(manifest_path.read_text())
    for effect in manifest:
        original = json.loads((ROOT / effect['preview']).read_text())
        html = original['html'].replace(GSAP, '__ATELIER_VENDOR_BASE__gsap-3.14.2.min.js')
        html = re.sub(r'<link\b[^>]*rel="preconnect"[^>]*>', '', html)
        def inline_font(match):
            link = match.group(0)
            name = 'anton' if 'family=Anton' in link else 'space-grotesk'
            return '<style>' + font_css[name] + '</style>'
        html = re.sub(r'<link\b[^>]*href="https://fonts.googleapis.com/css2[^>]*>', inline_font, html)
        html = html.replace('</body>', '<script src="__ATELIER_VENDOR_BASE__hyperframe.runtime-0.8.30.iife.js"></script>\n</body>')
        local_path = pathlib.Path(effect['preview']).with_name('preview-local.json')
        payload = json.dumps({'html': html}, ensure_ascii=False).encode()
        (ROOT / local_path).write_bytes(payload)
        effect['localPreview'] = str(local_path)
        effect['localPreviewSha256'] = hashlib.sha256(payload).hexdigest()
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    receipt = {name: {'source': url, 'sha256': hashlib.sha256((VENDOR / name).read_bytes()).hexdigest()}
               for name, url in {**DEPENDENCIES, **font_dependencies}.items()}
    (ROOT / 'data/local-dependencies.json').write_text(json.dumps(receipt, indent=2))
    print('Prepared six local previews; official originals unchanged.')

if __name__ == '__main__':
    compile_previews()
