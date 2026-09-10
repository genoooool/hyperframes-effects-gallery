# 搜索与 AI 可读性

本站使用同一份效果目录生成交互展厅和静态说明页。以下改进用于让内容容易被发现、读取和引用，不承诺搜索排名、AI 推荐或收录时间。

## 2026-09-11 修复

此前只有展厅首页和简短 llms.txt。卡片由 JavaScript 加载，没有可引用的效果详情地址，站点地图也只列出首页与 llms.txt。

现有公开入口：

- `/catalog/`：不依赖 JavaScript 的完整目录，八类效果、445 个详情链接和使用问答。
- `/effects/{id}/`：每个主效果的稳定说明页，包含实际描述、用途、预览、来源版本、许可记录、使用方式及接入限制；同组来源版本仍保留。
- 首页增加可见的文字介绍和目录入口；交互详情链接到独立说明页。`/?effect={id}#library` 可以从说明页直接进入对应预览。
- 每页提供一致的中文标题、摘要、canonical 和与正文对应的 JSON-LD。没有编造评分、发布日期、作者背书或适配状态。
- `sitemap.xml` 列出首页、目录及全部详情页，目前为 447 个 URL。不把未知的内容更新时间伪造成 lastmod。
- `llms.txt` 链接到目录和 `llms-full.txt`；后者提供与网页一致的完整文字资料。这些文件是辅助资料，不是 AI 收录协议或保证。
- `robots.txt` 保持允许公开页面抓取；新增 404 页面，避免不存在的地址返回展厅首页。

## 更新和检查

`python3 scripts/publish_gallery.py` 在生成统一目录后自动调用 `scripts/build_search_pages.py`，不手工编辑生成的目录和效果 HTML。

运行 `python3 scripts/check_search_pages.py`，核对所有详情页、站点地图、内部链接、JSON-LD 与完整文字覆盖。浏览器检查说明页 → 展厅预览 → 独立说明页的跳转。发布时使用 `scripts/prepare_public_site.py` 的白名单，QA、协调文档和内部来源凭据不公开。

发布后分别验证网站 HTTP 内容、代表性页面及媒体，以及 GitHub 远端提交。抓取通畅不等于已被百度、Google、豆包、DeepSeek 或其他 AI 检索服务收录。需要实际收录和引用证据才能报告可见度提升。

## 参考

- [Google：AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)：遵循基础搜索实践，正文可读、内部链接可发现，结构化数据应与页面一致。
- [Google：JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)：JavaScript 的抓取、渲染与索引是不同环节。
- [GEOFlow](https://github.com/yaojingang/GEOFlow)：内容工程和分发运营平台。本次针对现有静态站修复，没有安装该平台或批量生成宣传文章。
