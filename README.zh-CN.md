<p align="right">
  <a href="./README.md"><img alt="English" src="https://img.shields.io/badge/Language-English-CDFD8B?style=flat-square"></a>
</p>

# HyperFrames 动效与字幕效果库

[![在线展厅](https://img.shields.io/badge/在线展厅-77654321.xyz-CDFD8B?style=flat-square)](https://77654321.xyz/#library)
![效果](https://img.shields.io/badge/精选效果-445-171917?style=flat-square)
![来源版本](https://img.shields.io/badge/来源版本-461-171917?style=flat-square)

一个可交互、可追溯来源的 **HyperFrames 动效、视频转场、动态字幕、镜头运动、WebGL Shader 和短视频 UI 效果库**。先看真实效果，再打开固定版本源码或复制接入指令。

**[打开在线效果库 →](https://77654321.xyz/#library)**

![HyperFrames 动效库总览](docs/images/gallery-overview.jpg)

## 这是什么

这个项目服务于使用 AI 编程工具或 HTML 视频流水线制作短视频的人。它把 HyperFrames 官方模板和相关社区效果放进一个可搜索展厅，同时保留每种来源真实的技术边界。

- 官方效果链接到 HyperFrames Catalog 和固定版本源码。
- Remotion、GLSL、Web 效果保留原框架及接入状态。
- 视觉行为重复时优先展示 HyperFrames，其他版本保留在详情中。
- 卡片播放作者原始预览、固定源码实渲，或明确标注的 Atelier 自制样片。

## 当前收录

| 分类 | 效果数 |
| --- | ---: |
| 转场 | 184 |
| 动态字幕 | 58 |
| 镜头运动 | 25 |
| 局部强调 | 24 |
| 素材展示 | 36 |
| 节奏与情绪 | 37 |
| 信息提示 | 67 |
| 画面质感 | 14 |
| **合计** | **445** |

其中包含 **74 个 HyperFrames 官方效果**、**354 个社区效果**、**17 个 Atelier 自制模板**；视觉去重后仍保留 **461 个来源版本**。

Video Shotcraft 本批收录 178 个作者预览：173 张新增主卡、5 个已有主卡的来源变体。搜索 `shotcraft` 可找到全部收录项；原作预览与源码分别留档，均未移植到 HyperFrames。纯标题和品牌片头片尾的 36 个预览未收录，详见[来源审计](docs/ai/SOURCE_AUDIT.md)。

Atelier 知识与数据批次新增 17 个独立编写的参数化模板，涵盖图表、比较、来源脚注与机制讲解。搜索 `Atelier` 或选择自制来源筛选，详见[模板用法与参考映射](assets/atelier/knowledge/README.md)。

## 接入状态

| 标记 | 含义 |
| --- | --- |
| **HyperFrames 原生** | 官方 block 或 component，保留安装方式与源码路径。 |
| **Atelier 自制** | 带参数的本地 HyperFrames composition，附自制源码，不属于官方 registry。 |
| **Remotion** | React/Remotion 组件，需要 Remotion 宿主或有意识地移植到 HyperFrames。 |
| **GL Transition** | GLSL 转场，需要纹理、进度、宽高比参数和 WebGL 时间轴宿主。 |
| **Web 动效** | 浏览器、SVG 或 CSS 组件，需要把动画时钟接入视频时间轴。 |

“有预览”表示视觉效果经过检查，不表示所有社区效果都能执行 `npx hyperframes add` 直接安装。

## 展厅能力

- 八个短视频实用分类和六种来源筛选
- 按名称、风格、用途或作者搜索
- 默认只加载封面，全页同时只运行一个视频预览
- 桌面悬停试看，点击打开详情；手机端点击查看
- 进度、倍速、重播与本地收藏
- 固定版本源码、许可证、限制说明和 AI 使用指令
- HyperFrames 优先去重，同时保留同组其他版本

<table>
  <tr>
    <td width="70%"><img src="docs/images/effect-detail.jpg" alt="包含播放控制与源码链接的效果详情"></td>
    <td width="30%"><img src="docs/images/mobile-gallery.jpg" alt="手机端效果库"></td>
  </tr>
</table>

## 本地运行

```bash
git clone https://github.com/genoooool/hyperframes-effects-gallery.git
cd hyperframes-effects-gallery
python3 scripts/serve.py
```

打开 `http://127.0.0.1:4173`。项目自带的服务支持 MP4 Range 请求，能够正确拖动进度和从指定时间开始预览。

页面只读取 [`data/gallery-effects.json`](data/gallery-effects.json)。视频和封面保存在 `assets/`，浏览效果库时不会执行第三方模板代码。

## 重新生成与验证

```bash
python3 scripts/publish_gallery.py
python3 scripts/test_dedup.py
```

新增 Remotion 或 WebGL 预览还需要 Node.js、FFmpeg、Chrome，以及 `tools/community-render/` 中锁定的依赖。详细流程见[收集与渲染记录](docs/COLLECTION_PIPELINE.zh-CN.md)和[来源审查](docs/ai/SOURCE_AUDIT.md)。

## AI 与抓取入口

- [`/llms.txt`](https://77654321.xyz/llms.txt)：精简的项目说明和权威链接。
- [`data/gallery-effects.json`](https://77654321.xyz/data/gallery-effects.json)：线上展厅使用的结构化效果目录。
- 每个效果记录分类、来源、接入状态、预览方式和源码链接。

## 常见问题

### 这是 HyperFrames 官方项目吗？

不是。这是独立社区效果库。官方条目都会返回 [HyperFrames Catalog](https://hyperframes.heygen.com/catalog) 和固定版本源码。

### Remotion 和 GLSL 效果能在 HyperFrames 使用吗？

可以，但需要适配。Remotion 要把 React 动画映射为 HyperFrames composition；GLSL 要提供 WebGL 宿主和可按帧定位的 progress。复制指令会按真实来源说明接入方式。

### 页面播放的是视频还是真实效果？

效果库使用本地 MP4 做轻量预览。视频来自作者示例或固定版本源码的实际渲染，详情中会注明具体方式。

## 来源与许可证

本项目与 HeyGen、HyperFrames、Remotion 及收录作者没有隶属关系。第三方源码与媒体继续遵循原始许可证或作者条款；复用前请查看 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
