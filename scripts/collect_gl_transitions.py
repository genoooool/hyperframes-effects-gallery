"""Pin the original GLSL and prepare local, reproducible preview inputs."""
import hashlib
import json
import re
from collect_official import ROOT, fetch

COMMIT = '902218a1b63773ac0d0d9f491951da3392365bfe'
REPO = 'gl-transitions/gl-transitions'
NAMES = '''高级马赛克|方块溶解|翻书|弹跳落幕|横向蝴蝶结|纵向蝴蝶结|可调蝴蝶结|方框展开|蝶翼波纹|圆形裁切|色距溶解|参数曲线扭动|交叉变焦|失焦模糊|定向推移|定向缩放|毁灭战士落幕|梦幻波动|梦幻变焦|区域闪烁|边缘揭示|胶片燃烧|折叠|故障位移|故障残影|网格翻转|色相渐变|水平合拢|水平展开|反向卷页|左右交替|线性模糊|拼块马赛克|过曝闪光|波点幕帘|拼图推入|径向擦除|矩形展开|矩形裁切|向左旋转|滚动卷幕|旋缩消失|简洁翻转|简洁推进|简洁拉远|层叠滑片|星形擦除|噪点淡化|立体观片器|条带数据故障|旋涡|电视雪花|波浪瓷砖|上下交替|垂直合拢|垂直展开|水滴波纹|环形变焦|向左变焦擦除|向右变焦擦除|角度扫描|染色燃烧|燃烧溶解|叶形展开|棋盘交替|圆形遮罩|圆形开合|色彩分相|坐标推进|交叉排线|交叉形变|立方体|缓动推移|定向形变|定向擦除|纹理位移|颗粒溶解|门廊|交叉淡化|纯色过渡|灰阶过渡|复眼折射|碎片化|心形展开|六边形像素|万花筒|亮度遮罩|亮度融化|图像形变|拼贴过渡|正片叠底|老电视失去信号|参数故障|柏林噪声溶解|风车|像素化|极坐标花形|多重万花筒|随机噪声|随机方块|涟漪|旋转切换|旋转缩放淡化|缩放进入|水平分片进入|水平分片进出|垂直分片进出|垂直分片进入|水平分片退出|垂直分片退出|方格线框|挤压|噪声擦除|交换画面|切向运动模糊|波动燃尽|风吹|百叶窗|窗格切片|向下擦除|向左擦除|向右擦除|向上擦除|横轴平移|推近拉远'''.split('|')


def main():
    records = json.loads((ROOT/'data/research/gl-transitions-1.71.0.json').read_text())
    assert len(NAMES) == len(records)
    base = ROOT/'assets/community/gl-transitions'
    base.mkdir(parents=True, exist_ok=True)
    for name in ['LICENSE', 'README.md']:
        p = base/name
        if not p.exists(): p.write_bytes(fetch(f'https://raw.githubusercontent.com/{REPO}/{COMMIT}/{name}'))
    items = []
    for record, title in zip(records, NAMES):
        name = record['name']
        folder = base/name
        folder.mkdir(exist_ok=True)
        code = folder/(name+'.glsl')
        code.write_text(record['glsl'])
        (folder/'parameters.json').write_text(json.dumps({k: record[k] for k in ['paramsTypes', 'defaultParams']}, indent=2))
        source = f'https://github.com/{REPO}/blob/{COMMIT}/transitions/{name}.glsl'
        items.append({
            'id': 'gl-'+re.sub(r'[^a-z0-9]+', '-', name.lower()), 'title': title, 'en': name,
            'category': '转场', 'origin': 'glsl', 'sourceLabel': 'GL Transitions',
            'compatibility': 'GLSL 源码 · 待适配', 'type': 'glsl:transition',
            'desc': f'{title}。使用原作者 {name} shader 和默认参数，在两张统一测试画面之间演示实际切换。',
            'use': '镜头衔接 · 可调参数', 'tags': f'转场 GLSL WebGL {name} {title}',
            'duration': 2.5, 'poster': str((folder/'poster.jpg').relative_to(ROOT)),
            'videoPreview': str((folder/'preview.mp4').relative_to(ROOT)),
            'previewLabel': '源码实渲', 'page': f'https://gl-transitions.com/editor/{name}', 'source': source,
            'posterProgress': 0.12 if name in ['CircleCrop', 'Rectangle', 'RectangleCrop'] else 0.38,
            'install': f'读取 {name}.glsl 与 parameters.json；在 WebGL 宿主中提供前后画面纹理、progress（0–1）、ratio 和该效果参数。',
            'sources': [{'path': str(code.relative_to(ROOT)), 'url': source}],
            'provenance': {'commit': COMMIT, 'version': '1.71.0', 'license': record['license'], 'author': record.get('author'), 'sha256': hashlib.sha256(code.read_bytes()).hexdigest()},
            'videoProvenance': {'kind': 'locally-rendered-original-shader', 'renderer': 'scripts/render_community.mjs', 'fps': 24},
            'previewNote': '原始 GLSL 源码实渲；测试画面由本库生成，使用作者默认参数。视频仅供选效果，尚未接入 HyperFrames 时间轴。',
        })
    priority = ['BookFlip','cube','InvertedPageCurl','GridFlip','CrossZoom','Swirl','burn0','PolkaDotsCurtain','doorway','kaleidoscope','GlitchMemories','WaterDrop']
    items.sort(key=lambda item: priority.index(item['en']) if item['en'] in priority else len(priority))
    (ROOT/'data/gl-candidates.json').write_text(json.dumps(items, ensure_ascii=False, indent=2))
    print(f'{len(items)} original shaders prepared')


if __name__ == '__main__': main()
