# Awesome HyperFrames Gallery

可交互的 HyperFrames、Remotion、GLSL 与 Web 动效展厅，收集适合社交短视频的转场、字幕、镜头运动和常用视觉效果。原生 HTML/CSS/JS，播放作者示例或原始源码实渲预览。

**在线浏览：[77654321.xyz](https://77654321.xyz/#library)**

## 查看

在本目录运行 `python3 scripts/serve.py`，打开 http://127.0.0.1:4173 。服务支持视频 Range 请求，保证进度拖动与指定时间起播；普通 Python `http.server` 不支持此能力。

线上展厅：https://77654321.xyz/#library 。部署在 Cloudflare Workers Static Assets，项目名 `hyperframe-atelier`。线上发布包只包含网页、公开展示元数据、封面和预览视频，不包含采集脚本、原始源码、本机路径、哈希或内部审计材料。

Cloudflare 静态资产当前会忽略视频 Range 请求并返回完整文件；预览视频均为 fast start MP4，可以边下载边播放，但远程进度跳转和首次加载速度仍取决于文件大小与 CDN 缓存。当前最大视频约 6.22 MB。

## 当前 255 张主卡（8 类，266 条原始来源）

本轮新增 RemotionUI 的 11 个原始组件、Rough Notation 的 4 种标注，以及 3 个官方对应模板。收录倒计时、评论回复、投票浮层、挤压回弹、表情上浮、景深移焦、环绕、水面焦散与 CRT 等实际预览。共 74 张 HyperFrames 主卡、181 张社区主卡。

去重按已核对的视觉行为分组，HyperFrames 优先。同组 11 条合并到主卡详情的「同组来源与变体」，仍能切换原始预览、复制各版本指令和查看源码；原始文件未删除。方向、配色与缓动可作为同组变体；同名但动作不同、同一文件中的不同家族预设不自动合并。收藏旧 ID 自动迁移，搜索旧名称仍可找到主卡。

- HyperFrames 官方：28 个转场、15 个字幕。覆盖用户列出的 13 套 CSS 转场组合、14 个 shader 转场及像素网格擦除。
- Remotion 社区：`ahgsql/remotion-subtitles` 的 17 个字幕，作者 GIF 转为本地 MP4，并保留原始组件与 MIT 许可。
- GL Transitions：125 个独立 GLSL，使用同一组自制测试画面和默认参数渲染。全部 shader 与固定 Git 版本逐文件哈希匹配。
- `ali-abassi/remotion-templates`：10 个转场、6 个字幕家族预设，保留作者原视频、配置与共享源码；根目录无明确许可证，详情中已说明。
- 联网新增 `vshukla7/remotion-captions-themes` 的 13 个字幕主题、`Fats403/remotion-captions-kit` 的 6 个字幕预设。原始 React 组件在 Remotion Player 中渲染，未重写为 CSS 近似动画。
- 在原有 163 转场、57 字幕外，按用户追加授权加入 28 个官方样本：镜头运动 5、局部强调 5、素材展示 5、节奏与情绪 4、信息提示 5、画面质感 4。分类按用途整理，标题仍不单独收录。胶片颗粒恢复展示，高光仍归档。
- 社区条目标记「待适配」：可以看实际效果、拿到源码，但尚未转换为 HyperFrames HTML。复制指令分别处理官方、Remotion、GLSL，以及字幕和转场的不同用途。已发现的源码边界和 CSS 时钟限制随指令一起复制。
- 固定顶部导航，搜索、收藏、进度、倍速、重播、来源与固定版本源码链接保持可用。

## 预览与资源控制

默认仅加载封面，不加载视频。鼠标悬停 60ms 后才读取该模板的本地 MP4；点击打开详情。整页（含首屏精选）最多存在一个 video；移开、离开视口、关闭详情和页面隐藏时暂停、取消媒体请求并释放。系统开启减少动态效果时，默认关闭悬停预览。

官方 `preview.json` 与模板源码保持原样。有原视频时直接收集，无原视频时用 HyperFrames 0.8.30 渲染。社区包含作者视频、作者 GIF 转码、原始 GLSL、React 与 SVG 库实渲，详情分别说明。255 个主卡视频约 80.53 MiB，封面约 7.67 MiB；同组来源另保留。网页不初始化 iframe、GSAP 或完整运行库，也不执行第三方模板脚本。

新增六类的复现：`python3 scripts/collect_social_effects.py` → `python3 scripts/render_social_effects.py` → `python3 scripts/finalize_community_expansion.py`，独立目录为 `data/social-effects.json`。渲染副本仅本地化依赖和素材路径；手写清单使用原始字体。完成勾选的预览放大中心区域，保留完整原片及处理记录。逐项说明分层素材、静帧准备、背景与透明叠加等实际使用条件，复制指令按八类分别生成。

悬停 CSS 转场组合时从 4.25 秒开始，跳过开场等待；详情始终从头播放完整演示。首帧就绪前保留封面，仅在超过 900ms 时提示缓冲，失败或超时可重试。

预览只由卡片上的鼠标移动触发；打开页面、滚动或关闭弹窗把卡片放到静止鼠标下方时，不自动启动。卡片与收藏按钮共享悬停范围，避免移过星标时反复重启；视频首帧在封面上方淡入，滚动条保留占位以稳定弹窗前后的布局。

## 来源与复现

- 页面现在只读取 `data/gallery-effects.json`。各来源原始目录独立保留，`scripts/publish_gallery.py` 统一去重后生成展示目录和统计；不要手动改生成结果。
- 第三方第三轮：`python3 scripts/collect_community_round3.py` → `node tools/community-render/render-round3.mjs` → `python3 scripts/render_social_effects.py round3-official` → `python3 scripts/publish_gallery.py`。沿用现有 Remotion 4.0.441，不升级共享依赖。
- 去重规则与逐组源码证据：`data/dedup-rules.json`；结果与原 ID 重定向：`data/dedup-report.json`。`python3 scripts/test_dedup.py` 验证规则边界，`node scripts/check_gallery_round3.mjs` 在隔离浏览器验证收藏迁移、版本切换、播放释放及筛选。
- `burn` 的 npm 1.71.0 索引漏了源码内的 color 默认值，原预览因而与 fade 相同。现显式传入 `[0.9,0.4,0.2]`，以 `preview-color.mp4` 保留修正版；原 shader 未改动。可单独复现 `node scripts/render_community.mjs --only burn`，随后运行 publish。不能仅因两份视频哈希相同就断定两个效果重复。

- 官方仓库快照：`7a2a6917367e6dd7ce22f4c321c4a852dcf58dfd`。
- `data/official-effects.json`：中文分类、使用说明、官方 URL、原始文件路径与 SHA-256。
- `data/community-effects.json`：社区来源、版本、原始文件和「待适配」状态。
- `data/gl-effects.json` / `ali-effects.json` / `native-caption-effects.json`：本轮三个新增目录；保留逐项来源、许可证、预览制作方式与接入限制。
- `assets/official/<name>/`：官方封面、原始预览包、原始模板文件与注册信息。
- `assets/community/remotion-subtitles/`：作者原始 GIF、组件、许可与转码视频。
- 收集顺序：`python3 scripts/expand_official.py` → `python3 scripts/finalize_collection.py` → `python3 scripts/collect_remotion_captions.py`。复用已有文件；缺少官方视频的两项通过已安装的 HyperFrames CLI 渲染。依赖 Python、FFmpeg，以及渲染用的 HyperFrames 0.8.30。
- `scripts/collect_official.py` 现在只提供共享下载函数，旧六项入口已停用，避免覆盖新目录；`prepare_local_previews.py` / `render_previews.py` 为首批预览的历史工具，不用于当前批量收集。
- `assets/vendor/`：保留固定版本渲染依赖。原始代码许可证在各自来源目录。
- `official-gallery.js`：当前页面逻辑。`app.js` 是首轮 Canvas 样式稿，当前页面不再加载。

本轮社区复现：

1. `python3 scripts/collect_gl_transitions.py` 准备固定版本原始 shader 和参数（输入 `data/research/gl-transitions-1.71.0.json`，来源 npm 1.71.0，与 Git blob 哈希完全一致）。
2. `node scripts/render_community.mjs` 一次性生成 GLSL 视频；已有视频复用。`--posters-only` 仅更新封面。
3. `python3 scripts/collect_more_community.py` 收集 ali-abassi 预览与家族源码，并准备两个新增字幕库的预览清单。两个字幕库的固定源码已保存在 `assets/community/`。
4. 在 `tools/community-render` 安装锁定依赖后，运行 `node tools/community-render/render.mjs`，用 Remotion 4.0.441 和 React 18.3.1 生成字幕视频。
5. `node scripts/check_gl_endpoints.mjs` 检查转场两端；`python3 scripts/finalize_community_expansion.py` 发布已检查的接入提示和目录统计。

渲染脚本连接既有 4173 服务，单独启动临时无头 Chrome，结束自动关闭。可用 `ATELIER_CHROME`、`ATELIER_PUPPETEER` 指定本机路径。`tools/community-render` 约 18 MiB（其中依赖约 17 MiB），作为后续新增预览的复用工具保留；重建时复用，取消源码渲染工作流后才需要清理。

具体仓库核对、收录范围、排除原因和 Remotion 适配路径见 [来源审查](docs/ai/SOURCE_AUDIT.md)。

## 来源与许可证

本项目是独立社区项目，与 HeyGen、HyperFrames、Remotion 及收录的第三方作者没有隶属关系。每个效果的详情页保留原始来源、固定版本和适配状态；第三方源码与媒体继续遵循各自目录中的许可证或原作者条款。仓库根目录没有为第三方内容重新授予统一许可证，具体见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 已验证

2026-09-07：旧 HTML 播放器即使依赖已本地化，颗粒预览仍需约 1280ms 初始化。替换后，禁用浏览器缓存测得非转场首帧约 10–18ms；带指定起点的转场约 120–143ms。真实鼠标悬停颗粒约 75ms（含 60ms 防误触延迟），详情首帧约 27ms。这是当前本机测量，不代表其他设备或远程网络。

首批 60 项均通过视频解码抽帧与目视检查，并在网页中逐项播放成功，最多一个 video、结束后为零。本轮新增 160 项均完整解码成功，联系表已目视检查。125 个 GLSL 与固定 Git 源码完全一致；其中 AdvancedMosaic、tangentMotionBlur 在端点仍改变部分像素，保留原作并标记边界需校正。详细证据在 `data/qa/community-expansion/`。此前已验证详情暂停、进度定位、2× 倍速和服务 Range 支持。

本轮浏览器独立逐项加载 160 项，0 失败、最多一个播放器、结束为零；GLSL 立方体实播与 1 秒进度定位、新字幕实播通过。Remotion 筛选 52 项、GL Transitions 筛选 125 项，搜索支持作者来源。
