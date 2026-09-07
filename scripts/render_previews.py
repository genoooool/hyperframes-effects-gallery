"""Render the six pinned official previews once for lightweight gallery playback."""
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]


def main():
    manifest_path = ROOT / 'data/official-effects.json'
    effects = json.loads(manifest_path.read_text())
    for effect in effects:
        folder = ROOT / effect['preview']
        folder = folder.parent
        html = json.loads((ROOT / effect['localPreview']).read_text())['html']
        html = html.replace('__ATELIER_VENDOR_BASE__', 'assets/vendor/')
        source = folder / 'render.html'
        source.write_text(html)
        output = folder / 'preview.mp4'
        if not output.exists():
            subprocess.run([
                'npx', '--no-install', 'hyperframes', 'render', str(ROOT),
                '-c', str(source.relative_to(ROOT)), '-o', str(output),
                '--fps', '30', '--quality', 'standard', '--workers', '1',
            ], cwd=ROOT, check=True)
        probe = json.loads(subprocess.check_output([
            'ffprobe', '-v', 'error', '-show_format', '-show_streams',
            '-of', 'json', str(output),
        ]))
        duration = float(probe['format']['duration'])
        if abs(duration - effect['duration']) > 0.2:
            raise ValueError(f"Unexpected duration for {effect['id']}: {duration}")
        effect['videoPreview'] = str(output.relative_to(ROOT))
        effect['videoProvenance'] = {
            'kind': 'locally-rendered-official-preview',
            'officialPreviewSha256': hashlib.sha256((ROOT / effect['preview']).read_bytes()).hexdigest(),
            'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
            'renderer': 'hyperframes@0.8.30', 'fps': 30,
            'duration': duration, 'bytes': output.stat().st_size,
        }
        manifest_path.write_text(json.dumps(effects, ensure_ascii=False, indent=2))
        print(f"READY {effect['id']}: {output.stat().st_size} bytes", flush=True)


if __name__ == '__main__':
    main()
