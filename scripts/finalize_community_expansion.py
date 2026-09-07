"""Publish inspected compatibility caveats and current collection totals."""
import json
from collections import Counter
from collect_official import ROOT


def main():
    path=ROOT/'data/gl-effects.json';items=json.loads(path.read_text())
    endpoints={x['name']:x for x in json.loads((ROOT/'data/qa/community-expansion/gl-endpoints.json').read_text())}
    for e in items:
        e['endpointCheck']=endpoints[e['en']]
        if not e['endpointCheck']['pass']:
            e['usageStatus']='边界需校正'
            e['usageCaveat']='本库测试发现默认参数在 progress=0 或 1 时仍会改变部分原画面像素。接入宿主时，应在两个端点直接输出对应原画面，并检查进入、结束时有无跳变。'
            base='原始 GLSL 源码实渲；测试画面由本库生成，使用作者默认参数。视频仅供选效果，尚未接入 HyperFrames 时间轴。'
            e['previewNote']=base+' '+e['usageCaveat']
    path.write_text(json.dumps(items,ensure_ascii=False,indent=2))
    path=ROOT/'data/native-caption-effects.json';items=json.loads(path.read_text())
    for e in items:
        e['videoProvenance']['remotionVersion']='4.0.441'
        source=ROOT/e['sources'][0]['path']
        if 'transition:' in source.read_text():
            e['usageCaveat']='原组件含依赖浏览器时间的 CSS 过渡。这里保留其原生预览表现；接入可定位的视频时间轴时，需要统一到帧驱动，并检查跳转与导出的一致性。'
            base='使用原始 React 组件在 Remotion Player 中逐帧采集，示例文字和时间由本库提供。按作者字体栈使用本机可用字体；未转换为 HyperFrames。'
            e['previewNote']=base+' '+e['usageCaveat']
    path.write_text(json.dumps(items,ensure_ascii=False,indent=2))
    collections=['official','community','ali','native-caption','gl']
    if (ROOT/'data/social-effects.json').exists():collections.append('social')
    all_items=sum([json.loads((ROOT/f'data/{name}-effects.json').read_text()) for name in collections],[])
    assert len(all_items)==len({e['id'] for e in all_items})
    for e in all_items:
        assert (ROOT/e['videoPreview']).stat().st_size>0,e['id']
        assert (ROOT/e['poster']).stat().st_size>0,e['id']
    path=ROOT/'data/collection.json';collection=json.loads(path.read_text())
    collection.update({'count':len(all_items),'official_count':sum(e['origin']=='official' for e in all_items),
        'community_count':sum(e['origin']!='official' for e in all_items),
        'sources':dict(Counter(e['sourceLabel'] for e in all_items)),
        'category_counts':dict(Counter(e['category'] for e in all_items)),
        'categories':list(dict.fromkeys(e['category'] for e in all_items)),
        'video_mib':round(sum((ROOT/e['videoPreview']).stat().st_size for e in all_items)/1048576,2),
        'poster_mib':round(sum((ROOT/e['poster']).stat().st_size for e in all_items)/1048576,2)})
    path.write_text(json.dumps(collection,ensure_ascii=False,indent=2))
    if (ROOT/'data/gallery-effects.json').exists():
        from publish_gallery import main as publish
        publish()
    else:print(json.dumps(collection,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
