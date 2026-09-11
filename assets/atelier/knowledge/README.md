# Atelier 知识与数据动效

17 个独立编写的 HyperFrames 模板。透明画布、现代石墨色与清晰无衬线排版，默认水平居中；图表使用半透明底板，步骤、状态和回路按内容使用局部节点，不统一加外框。文字、数值、标签、配色可通过参数替换。每个模板的 `index.html` 与 `gsap.min.js` 在同一文件夹内，可以独立复制使用。设计规则见 `DESIGN.md`。

## 参考与归属

形式与用途盘点参考 [栗噔噔的 hyperframes-motion-library](https://github.com/nutllwhy/hyperframes-motion-library)，参考版本 `fe59998fa3f2c8579ba5ddd00cbbb76131190bdb`。我们未复制该库的模板源码、默认文案、图片或样片。独立重写了排版、SVG 图形、时间线和示例内容。逐项映射见 `reference-map.json`：17 个自制版本，6 个已由现有库提供同类能力。映射代表用途覆盖，不代表逐帧复刻。

这些是 Atelier 自制本地模板，不是 HyperFrames 官方 registry 条目，不支持 `hyperframes add`。HTML/CSS/JS 模板代码采用本目录 MIT 许可；GSAP 为既有第三方依赖，其文件头中的版权和许可仍适用。

## 使用

```sh
npx hyperframes check assets/atelier/knowledge/column-reveal
npx hyperframes render assets/atelier/knowledge/column-reveal \
  --variables-file assets/atelier/knowledge/column-reveal/default.json \
  --strict-variables --fps 24 --output column-reveal.mp4
```

展厅的“下载模板包”提供每个模板的 `template.zip`，包含源码、GSAP、参数、MIT 许可和简短使用说明。解压后可以独立运行。先复制 `default.json`，修改自己的参数，再用它渲染。`variables.json` 记录可用参数声明。页面中常见参数：

- `title`：主句，最多 24 字；`labels`：以 `|` 分隔的标签；`values`：以英文逗号分隔的非负有限数值。
- 图表接受 3–7 项；横条、双值需要两项；排名需要三项；流程、因果链、阶段轴需要三项；闭环需要四项。不要混用单位，标签须与数值一一对应。
- `unit`：单位；`note`：口径或补充说明。默认数字均为演示数据，不能当成实测或性能承诺。
- `accent` / `background`：六位十六进制颜色。改色后重新检查对比度。
- `focus` / `explanation`：拐点图的零起始节点位置和解释；`detailA` / `detailB`：两种方案的说明。
- `transparent`：取消画布底色，保留必要信息面板。MP4 样片不带透明通道；需要叠加素材时改用支持 alpha 的格式并检查结果。
- `transparent` 默认开启；`panelOpacity` 默认 82，允许 70–96，只改变底板，不把文字一起变淡。展厅 MP4 使用单独的深色背景参数渲染，不改写下载包里的透明默认值。

模板设计尺寸 960×540，6 秒，主要信息在末段保持。可使用 HyperFrames 支持的整数倍分辨率输出；长文本应拆句，不能仅靠缩小字体塞进画面。技术渲染通过与用户对视觉设计的接受是两个状态。

本地统一审阅：启动项目预览服务后打开 `/prototypes/atelier-review/preview.html`，切换 17 个模板、背景和底板不透明度，也可选择本地视频试叠（仅浏览器读取，不上传）。布局不会自动识别人脸或字幕。

## 维护

`scripts/build_atelier_knowledge.py` 的声明、`theme.css` 与 `runtime.js` 是本批生成源。修改后运行生成器，再按 `scripts/render_atelier_knowledge.py` 检查和渲染；内容哈希未变化时复用已验证样片。`data/atelier-effects.json` 只在本批全部成功后发布，统一目录由 `scripts/publish_gallery.py` 生成。
