# 透明柱状图样板

用户认可现代素材盘点叠加卡后追加的柱状图设计审阅稿。数据为四周演示值 24 / 38 / 32 / 56，不是实际业务统计。

- `index.html`：1280×720、6 秒、透明画布、82% 不透明度底板，原生 HyperFrames 单一 GSAP 时间轴。
- `preview.html`：背景选择、本地视频试叠、不透明度、播放/暂停/重播/拖动。视频仅在浏览器读取，不上传；预览设置不会写回构图源码。
- `DESIGN.md`：布局、字号、颜色、数据比例和运动编排。
- `gsap.min.js`：字节复用既有素材盘点样板的 GSAP，保留版权声明。

复用项目本地服务 `python3 scripts/serve.py --port 4189`，打开 `/prototypes/bar-chart/preview.html`。若已有服务，不重复启动。此目录不在公开发布白名单中。

验证：`npx --no-install hyperframes check prototypes/bar-chart --json`，以及关键帧与浏览器目视检查。透明 PNG 不等于已导出透明视频；此轮交付为可播放 HTML 设计样板。
