"""Build an allowlisted static upload folder, never upload the repository."""
import argparse
import hashlib
import json
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC_FIELDS = set('id title en category origin sourceLabel compatibility type desc use tags duration poster videoPreview page source install previewLabel usageStatus previewNote usageCaveat hoverStart dedupGroup dedupReason searchAliases'.split())
STATIC = ['index.html','styles.css','official-gallery.js','llms.txt','robots.txt','sitemap.xml','README.md','README.zh-CN.md','THIRD_PARTY_NOTICES.md','docs/ai/SOURCE_AUDIT.md','docs/COLLECTION_PIPELINE.zh-CN.md']

def public_effect(effect):
    clean = {k: v for k, v in effect.items() if k in PUBLIC_FIELDS}
    clean['provenance'] = {k: v for k, v in effect.get('provenance', {}).items() if k in {'commit','license','version'}}
    if effect.get('alternatives'):
        clean['alternatives'] = [public_effect(e) for e in effect['alternatives']]
    return clean

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=pathlib.Path)
    args = parser.parse_args()
    dest = args.destination.expanduser().resolve()
    if dest.exists():
        raise SystemExit('Destination already exists; reuse its verified files or choose an explicitly new candidate.')
    if dest == ROOT or ROOT in dest.parents:
        raise SystemExit('Keep upload staging outside the repository.')
    catalog = json.loads((ROOT/'data/gallery-effects.json').read_text())
    public = {k: catalog[k] for k in ['redirects','rawCount','mergedCount']}
    public['effects'] = [public_effect(e) for e in catalog['effects']]
    payload = json.dumps(public, ensure_ascii=False, indent=2)+'\n'
    for forbidden in ['"sources":','"sourceManifest":','"videoProvenance":','"renderProps":','"sha256":','/Users/','/private/tmp/']:
        if forbidden in payload:
            raise ValueError('Private/internal catalog field: '+forbidden)
    files = set(STATIC)
    files.update(str(p.relative_to(ROOT)) for p in (ROOT/'docs/images').glob('*') if p.is_file())
    for effect in catalog['effects']:
        for item in [effect]+effect.get('alternatives', []):
            for key in ['poster','videoPreview']:
                relative = pathlib.Path(item[key])
                source = (ROOT/relative).resolve()
                if relative.is_absolute() or ROOT not in source.parents or not source.is_file():
                    raise ValueError('Invalid public asset '+str(relative))
                if source.stat().st_size > 25*1024*1024:
                    raise ValueError('Asset exceeds 25 MiB: '+str(relative))
                files.add(str(relative))
    dest.mkdir(parents=True)
    records = []
    for relative in sorted(files):
        target = dest/relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT/relative, target)
        records.append({'path':relative,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    target = dest/'data/gallery-effects.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(payload)
    records.append({'path':'data/gallery-effects.json','bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    report = {'destination':str(dest),'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'effects':len(public['effects']),'sourceVariants':public['rawCount'],'fileCount':len(records),'bytes':sum(x['bytes'] for x in records),'files':records}
    qa = ROOT/'data/qa/shotcraft'
    qa.mkdir(parents=True, exist_ok=True)
    (qa/'public-package.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='files'},ensure_ascii=False,indent=2))

if __name__ == '__main__':
    main()
