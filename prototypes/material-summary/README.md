# 素材盘点：现代双数据卡样板

独立设计审阅稿，尚未作为整套动效库的接受版本。保留原示例的 24 份视频和 36 份图片，总量与比例由这两项推导。没有接入真实统计。

- `index.html`：1280×720、6 秒、单一可寻址 GSAP 时间轴的 HyperFrames 构图。
- `preview.html`：响应式预览播放器，支持重播、暂停和拖动进度。控制器只存在于预览页。
- `DESIGN.md`：这张样板的设计意图和尺寸，不代表其他模板必须套同一布局。
- `gsap.min.js`：复用项目既有 GSAP，保留原始版权声明。

在仓库根目录运行 `python3 scripts/serve.py --port 4189`，打开 `/prototypes/material-summary/preview.html`。关闭对应终端服务即可结束预览。

验证：`npx --no-install hyperframes check prototypes/material-summary --json`。当前测试工具为 HyperFrames 0.8.34；中文使用系统无衬线字体，此次在 macOS 上确认，跨系统导出需要固定字体并重新目视检查。入场数字有意移入裁切窗口，检查器可报告瞬间裁切 info。

此样板不在公开站点的白名单发布目录中，未改变线上模板。它仍是设计提案，不以技术检查代替用户的视觉评价。
