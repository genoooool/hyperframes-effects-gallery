# 来源收集与适配核对

## 2026-09-08：Video Shotcraft 全范围补充

- 固定源码：`Vincentwei1021/video-shotcraft@5f047c7cfe10d6616fe59160a750fcfaea510b2e`。原目录为 157 张配方卡、214 个预览；逐卡清单在 `assets/community/video-shotcraft/selection.json`。
- 收录 127 张配方卡、178 个预览；排除 30 张纯标题/品牌卡的 36 个预览。两种随声同步动作归字幕；文档、代码、状态文字归信息提示。用文字或假 UI 示范通用运动的组合镜头仍保留其真实用途说明。
- 422 个配方、原始组件、共享依赖、纹理与许可文件保留原字节，逐文件验证 Git blob 和 SHA-256，共约 5.25 MiB。只保留这套小型源文件包，不下载工作台、构建依赖或音频；组件导航遵循卡片中的准确路径。
- 178 个 MP4 是作者展厅原始预览，共约 110.53 MiB。媒体不在源码 Git 树内，`previews/*/receipt.json` 分别记录 URL、下载时间和 SHA-256；源码版本不能证明预览与源码逐帧一致。没有重渲或 HyperFrames 移植。
- 五项归入已有来源组：底边上推、前后对比拉杆、数字滚轮、交叉纸屑喷射、甩镜。官方保持主卡，Shotcraft 视频和指令在详情切换。源码依据在 `data/dedup-rules.json`，对比抽帧在本地 `data/qa/shotcraft/dedup-comparison.jpg`。
- 保留差异：伪滑动变焦与真实透视补偿不同；数字冲刺＋纸屑为组合动作；暖白径向闪光不同于全屏闪白；全词组节拍脉冲不同于逐词强调。不按名称、共用源码或相同示范布局自动合并。
- 当前 428 张主卡、444 条来源，新增 173 张主卡和 5 个来源变体。分类：转场 184、字幕 58、镜头运动 25、局部强调 24、素材展示 36、节奏与情绪 37、信息提示 50、画面质感 14。
- 178 个视频完整解码、封面联系表检查和浏览器逐项加载/定位通过；五次来源切换、八类搜索、2× 播放、390px 手机操作通过；最多一个 video，关闭后归零，无页面异常。QA 与截图在本地 `data/qa/shotcraft/`。

以下是此前批次的历史范围和计数。

核对日期：2026-09-07。最新授权扩展为八类社交短视频效果，标题与完整宣传片仍不收录。以下各轮保留当时的来源核对范围。

## 第四轮第三方与去重：255 主卡 / 266 来源

用户授权继续搜集第三方，并要求相同效果优先 HyperFrames。新增 18 条来源（社区 15、官方 3），7 个已核对效果组收拢 11 条变体。这里的去重是展示分组：方向、配色、缓动与笔触差异在详情保留原片，并非声称源码或像素完全相同；名称相同、共享同一 TSX 文件不会自动合并。逐组依据在 `data/dedup-rules.json`，机器结果在 `data/dedup-report.json`。

| 核对来源 | 结果 |
| --- | --- |
| [riaz37/remotion-ui](https://github.com/riaz37/remotion-ui/tree/2fadcce50badf4ab726b2fb889ed8871acfa4348) | 收录 11 个原始 React 组件，MIT，下载完整所需源码依赖闭包并校验 Git blob。预览沿用 Remotion Player 4.0.441；Inter 同款字体本地化，表情按组件支持的后备栈使用 Apple Color Emoji。共 10 张独立主卡，纸屑效果收在 HyperFrames 彩纸庆祝的详情中。 |
| [rough-stuff/rough-notation](https://github.com/rough-stuff/rough-notation/tree/668ba82ac89c903d6f59c9351b9b85855da9882c) | MIT，保留源码与 0.5.1 原版浏览器包。收录下划线、荧光笔、叉除、括号四种实际 SVG 动画；其中下划线、荧光笔及括号归入对应官方模板，叉除独立保留。调用原库，捕获时固定随机数并定位原生 CSS 动画，不等于已适配 HyperFrames。 |
| [av/remotion-bits](https://github.com/av/remotion-bits/tree/6c71169aa061f15313fadbdc6e29a3a3a87f2c03) | 核对 README、组件树；本轮优先补更直接的社交视频组件，未完整渲染此库，不宣称没有更多独特效果。快照保留供后续选取。 |
| [elrumordelaluz/csshake](https://github.com/elrumordelaluz/csshake/tree/4b9caede44bc93ac83de3ee795fe044832ceb484) | 核对作者 README 与源码树，基础摇晃与现有镜头震动用途重叠，本轮不再堆入一组相近摇晃卡片；未对全部变体做像素等价声明。 |

HyperFrames 原固定版本补齐 `hw-underline`（实际包含 underline/strike/bracket）、`marker-highlight`、`confetti`，有视频则复用、无视频则实渲。RemotionUI `light-rays` 需要新 `Solid/createEffect`，当前 4.0.441 没有这两个 API，未收录到可用展示，未升级整套渲染依赖。

哈希扫描发现 `burn` 与 `fade` 原视频相同，追到上游 npm 1.71.0 漏解析 `uniform vec3 color /* = vec3(0.9, 0.4, 0.2) */`，而非效果本身相同。现按作者注释设置参数并另存修正版视频，保留原 shader 和原片，两个效果不合并。修正后原始来源中无视频字节哈希重复。

验证：新增及修正 19 个视频完整解码；浏览器逐项加载及 11 次变体切换通过；旧收藏 ID 迁移与别名搜索通过；最多一个播放器，关闭后释放。去重 5 项回归通过。证据 `data/qa/round3/`。

## 第三轮六类扩充：当前 248 项

新增 28 个 HyperFrames 官方样本：镜头运动 5、局部强调 5、素材展示 5、节奏与情绪 4、信息提示 5、画面质感 4。分类由本库按用途整理，不冒充官方原有分类。沿用官方固定版本 `7a2a6917367e6dd7ce22f4c321c4a852dcf58dfd`，原始文件、SHA-256 与预览出处见 `data/social-effects.json`。

有官方 MP4 则复用，无视频则渲染官方 preview HTML；渲染副本只调整本地路径与依赖，保留原始动画和演示内容。手写清单本地化原版两款字体；完成勾选放大中心区域，另存展示视频，完整原片和处理记录保留。滑动变焦需要分层素材、定格包装需要静帧、颗粒场是背景的限制均写入详情与复制指令。此次没有新增社区移植。

28 项完成解码、封面检查及浏览器逐项加载，0 失败；同时最多一个播放器，关闭后为零。八类筛选计数正确；当前浏览器中筛选栏固定位置为顶部 80px，与导航高度一致，无横向溢出。证据目录 `data/qa/social-expansion/`。

## 第二轮社区与联网扩充：当前 220 项

用户进一步授权继续收集社区和联网来源，本轮新增 160 项，原有 60 项保留。这里记录的是已收录的独立 shader、组件或家族预设数，不意味着有 220 种完全不同的视觉风格。

| 来源 | 本轮新增 | 实际交付 |
| --- | ---: | --- |
| [gl-transitions/gl-transitions](https://github.com/gl-transitions/gl-transitions/tree/902218a1b63773ac0d0d9f491951da3392365bfe) | 125 转场 | npm 1.71.0 全部 shader 与 Git blob SHA-1 一致；原始 GLSL、默认参数、作者与各文件许可、本地 MP4/封面。使用本库自制两张测试画面，统一进度，不改变 shader。 |
| [ali-abassi/remotion-templates](https://github.com/ali-abassi/remotion-templates/tree/6430d423c417b360e598b64a852e7cc57ed9afbe) | 10 转场 + 6 字幕 | 原始作者 MP4、预设 registry、两个共享家族 TSX 与 src/lib 依赖。字幕只取 high-contrast、speaker、karaoke、box、highlight、large-type；音频描述卡、片尾、手语空间等未作为字幕效果收录。根无明确 LICENSE，已保留提示。 |
| [vshukla7/remotion-captions-themes](https://github.com/vshukla7/remotion-captions-themes/tree/c2cfe29cb732bf01aac2a92b84f58fda28fc182e) | 13 字幕 | 本轮联网发现。README 列出 11 个主题，但源码 registry 实际导出 13 个，额外包含 kinetic-02 和 podcast。保留完整 src 与 MIT；逐个用原始组件、逐词样例时间渲染。 |
| [Fats403/remotion-captions-kit](https://github.com/Fats403/remotion-captions-kit/tree/97232270364bd6bba4ca8d11180c350409495e95) | 6 字幕 | 本轮联网发现。保留 MIT 源码、分页/时间轴依赖、六个实际导出预设，用 captionsFromWords → createCaptionPages → CaptionTrack 接入示例逐词时间。 |

新来源搜索也检查到 [Remotion Elements](https://www.remotion.dev/elements)、[template-tiktok](https://github.com/remotion-dev/template-tiktok)、Vanta / OpenCut 等工作流项目。后两类是编辑/渲染/字幕流水线或对现有库的封装，不按整项目增加一个特效；Remotion Elements 和 template-tiktok 留作原生接入参考，本轮未额外收录其整套模板。未声称穷尽互联网或所有仓库历史。

新增目录分别为 `data/gl-effects.json`、`data/ali-effects.json`、`data/native-caption-effects.json`。页面提供 GL Transitions 筛选；Remotion 筛选合计 52 项，其中 42 字幕、10 转场。所有社区项仍是待适配，渲染预览不是 HyperFrames 移植交付。

### 实际检查结果

- 新增 160 视频完整 FFmpeg 解码均成功；7 张联系表目视检查。125 GLSL 源码 Git blob 逐文件一致，无 shader 编译失败。
- 125 个 shader 用相同纹理检查 progress=0 和 1。AdvancedMosaic 与 tangentMotionBlur 有超过 1% 像素与原画面相差超过 12/255，属于原作端点量化/模糊表现，保留原作并标注“边界需校正”；复制指令要求宿主在端点输出原图。其他 123 项通过此阈值检查，不代表已通过 HyperFrames 集成测试。
- CircleCrop / Rectangle / RectangleCrop 的默认转场中段会收至黑色，属于原作行为，封面选较早帧避免误解为加载失败。预览仍保留完整原作过程。
- 原始 React 在 Remotion Player 4.0.441 / React 18.3.1 中采集。本库提供样例文字、时间、背景和颜色，沿用原字体栈（本机无对应字体时回退）；不宣称与作者独立网站的字体完全相同。部分 vshukla7 组件包含 CSS 过渡，已在详情与复制指令中提示接入时统一帧时钟，未擅自修改作者源码。
- 浏览器独立一轮逐项加载 160 新预览：160 成功、0 失败、最多 1 个 video、结束 0 个。初始测试脚本曾因 close 事件尚未派发就打开下一项导致误报；修正为等待 close 后，刷新页面取消旧测试，再独立运行，结果记录在 `data/qa/community-expansion/browser.json`。
- 视频全库 56.76 MiB、封面 7.32 MiB；默认 0 个 video。新增本机渲染工具约 18 MiB，保留为可复用预览工作流。头部固定与按需单播放器策略不变。

## 首批 60 项（历史收集记录）

| 来源 | 数量 | 当前状态 |
| --- | ---: | --- |
| HyperFrames 官方 | 28 个转场、15 个字幕 | 原生模板源码已收集，预览均已本地化 |
| ahgsql/remotion-subtitles | 17 个字幕 | 作者 GIF 转为 MP4，原始 React 组件已保存；未移植到 HyperFrames |

官方转场覆盖用户列出的 13 套 CSS 组合、14 个 shader 转场和 `grid-pixelate-wipe`。字幕按真正的 caption 序列选取；不把 `caption-texture`、`caption-blend-difference` 这类装饰文字作为新增字幕收录。

官方 43 项中，37 项使用来源 metadata 指向的官方视频，原先 4 项沿用已验证渲染，2 项新增本地渲染（镜头跟随字幕、像素网格擦除）。没有全量克隆仓库或把标题组件改名充数。

固定版本与文件路径：

- [HyperFrames](https://github.com/heygen-com/hyperframes/tree/7a2a6917367e6dd7ce22f4c321c4a852dcf58dfd)：`data/official-effects.json` / `assets/official/`。
- [Remotion Subtitles](https://github.com/ahgsql/remotion-subtitles/tree/d8ad50fd5bc94b5ec3e5388a2b535fa85553fd43)：`data/community-effects.json` / `assets/community/remotion-subtitles/`，保留 MIT LICENSE、原始 GIF、源码与组件导出表。

## 首轮 Remotion 到 HyperFrames 源码评估（下表处理状态为扩充前）

这里的“可适配”是源码分析结论，不是已经完成转换。未运行 Remotion 与 HyperFrames 双侧画面对比，不标记“已适配”。网页显示“Remotion 原生 · 待适配”，复制指令也不会错误生成 `hyperframes add`。

| 仓库 | 实际内容与依据 | 适配判断 / 本轮处理 |
| --- | --- | --- |
| [ahgsql/remotion-subtitles](https://github.com/ahgsql/remotion-subtitles) | 17 个组件；Bounce、Fade、Glitch 等使用 `useCurrentFrame`、`useVideoConfig` 和 `interpolate` 计算 CSS。Typewriter 还截取文本、计算光标；ThreeDish 主要是静态文字样式。 | 低到中等工作量。把帧数映射到局部时间、JSX 改为 DOM、逐句接入字幕时间轴；保留原插值和样式。需核对中文字体、换行、每句时长与定位。17 个作者预览已收录，未实际转换。 |
| [ahgsql/remotion-animation](https://github.com/ahgsql/remotion-animation) | 固定版本 `94d86f00…` 的 `src/index.js` 以暂停的 CSS animation 和负 `animationDelay` 按帧定位；是 animate.css 桥接器。 | CSS 关键帧可复用，改为 HyperFrames 可 seek 的时间控制即可；它本身并非 80 个独立字幕模板，本轮不按数量重复收录。 |
| [gl-transitions/gl-transitions](https://github.com/gl-transitions/gl-transitions) | 固定版本 `902218a1…`；每个 shader 独立，输入包含前后画面采样与进度。根 LICENSE 为 MIT，个别文件可有自身头部许可。 | 中等工作量。需 WebGL 宿主提供两张纹理、进度、宽高比与参数，并接入可定位时间轴；不能直接当 HTML block 安装。本轮检查代码接口，未批量制作预览或移植。 |
| [remotion-dev/gl-transitions](https://github.com/remotion-dev/gl-transitions) | 固定版本 `128ba687…`；`GLTransitions.tsx` 初始化 canvas 后调用 `drawFn(frame)`，使用 `delayRender/continueRender` 等 Remotion API。 | 可复用底层 shader 思路；React hooks、加载握手与渲染时钟需替换。适合作为接入参考，不等于已经支持 HyperFrames。 |
| [ali-abassi/remotion-templates](https://github.com/ali-abassi/remotion-templates) | 固定版本 `6430d423…`。当前 README 宣称 100 家族、1000 参数化条目；已核对 transitions 和 accessibility-captions 的 registry / TSX，树中存在对应 MP4 和缩略图。十种转场共享 React 家族引擎。 | 比旧“模板索引”描述更完整，但 1000 不等于 1000 个独立效果。需要家族级 JSX/插值/共享 primitive 转换。当前只核对与登记，未把整仓重复搬进库。仓库 README 要求继续核对第三方来源，根未提供明确 LICENSE 文件。 |
| [Remotion Bits](https://remotion-bits.dev/docs/getting-started/) | 文档有 AnimatedText、Typewriter、GradientTransition、粒子和 3D 组件。多数是通用动效基础件。 | 文字组件可组合成字幕；仍需补逐句时间轴。粒子背景、3D 场景、普通标题入场不在当前范围，本轮只评估文档。 |
| [mifi/editly](https://github.com/mifi/editly) | JSON 声明式剪辑工具，使用 gl-transitions 作为底层切换来源。 | 属于渲染工作流，不能作为 HyperFrames 模板直接安装；避免与 shader 库重复计数。 |
| [claude-remotion-kickstart](https://github.com/jhartquist/claude-remotion-kickstart) / [claude-video-editor](https://github.com/assafkip/claude-video-editor) | 项目启动工具与整片编辑工作流。 | 当前不把整套工作流列成某一个转场或字幕。 |

建议试点顺序：Fade / Bounce → Typewriter / Glitch → 单个 GLSL 转场 → 较复杂的 React 家族。每项适配前后使用相同文字、时间、画幅和素材比较；保留原始预览入口，成功后才更新状态。

## 前面提到的 HyperFrames 社区仓库

已检查仓库首页与 README 展示范围，未声称对每个完整项目做过逐文件拆解：

- [hyperframes-motion-library](https://github.com/nutllwhy/hyperframes-motion-library)：早期仅转场/字幕阶段未收录。2026-09-11 根据用户要求，按固定版本 `fe59998fa3f2c8579ba5ddd00cbbb76131190bdb` 的 23 项目录重新盘点：17 项以独立实现补入信息提示类，另 6 项对应已有数字、标记、清单能力。此次仅借鉴形式和用途，不分发上游源码、文案或样片；浅纸色的自制版本与上游原作明确区分。映射见 `assets/atelier/knowledge/reference-map.json`。
- [hyperframes-student-kit](https://github.com/nateherkai/hyperframes-student-kit)：12 个完整教学项目；不为收录一个效果先拆整片。
- [hyperframes-launches](https://github.com/heygen-com/hyperframes-launches)：官方发布会成片，存在 LFS 素材；保留为参考来源，未下载整片。
- [hyperframes-helper](https://github.com/robonuggets/hyperframes-helper)：HTML-to-MP4 工作流辅助套件，非独立效果目录。
- [cyxj-hyperframes](https://github.com/chenyuxiaojin/cyxj-hyperframes)：教程项目和可复用工具；本轮不拆整片或扩展到图形包装。

FFmpeg `xfade` 属于可用的另一路渲染能力；用户本轮要求先收集已有库并核对 Remotion，因此未额外生成一套重复的 FFmpeg 演示。

## 验证与限制

- 60 个视频均成功解码抽帧，三张联系表已逐项目视检查；官方 shader、字幕、两项本地渲染以及 Remotion 作者示例画面均可见。
- 浏览器逐项打开 60 项：无首帧失败，同时最多一个 video，结束后为零；Remotion 来源筛选返回 17 项。
- 视频合计约 28.2 MiB，封面约 3.1 MiB；默认不加载视频，屏幕外没有运行的预览。
- 社区 GIF 转 MP4 保持时序和内容，使用 H.264 / yuv420p 兼容格式；有损编码与 GIF 原始帧率限制保留，不能称作重新渲染的高清源码结果。
- 此次没有执行 Remotion 组件到 HTML 的转换或一键安装适配。来源审查、预览可播和实现已适配是不同状态。
