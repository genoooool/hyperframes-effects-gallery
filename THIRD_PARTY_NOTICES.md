# Third-party notices

HyperFrames Effects Gallery is an independent index and preview gallery. It is not affiliated with HeyGen, HyperFrames, Remotion, or the authors of the indexed projects.

The gallery preserves the source URL, pinned revision, license label, and adaptation status for each effect in `data/gallery-effects.json`. Bundled upstream source files and media remain subject to their original licenses and authors' terms.

| Source | Included material | License status |
| --- | --- | --- |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Registry blocks and previews | Apache-2.0; copy preserved in `assets/official/LICENSE` |
| [gl-transitions/gl-transitions](https://github.com/gl-transitions/gl-transitions) | GLSL shaders and locally rendered previews | MIT, BSD-2-Clause, or BSD-3-Clause per shader; root copy preserved |
| [ahgsql/remotion-subtitles](https://github.com/ahgsql/remotion-subtitles) | Components and author previews | MIT |
| [vshukla7/remotion-captions-themes](https://github.com/vshukla7/remotion-captions-themes) | Components and locally rendered previews | MIT |
| [Fats403/remotion-captions-kit](https://github.com/Fats403/remotion-captions-kit) | Components and locally rendered previews | MIT |
| [riaz37/remotion-ui](https://github.com/riaz37/remotion-ui) | Components and locally rendered previews | MIT |
| [rough-notation](https://github.com/rough-stuff/rough-notation) | Annotation source and locally rendered previews | MIT |
| [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | 178 author previews, recipe cards, unmodified demo components and shared fixtures/textures at `5f047c7` | Apache-2.0; original `LICENSE` and shot attribution notes preserved in `assets/community/video-shotcraft/`. Demo screenshots/copy are placeholders to replace for production; audio is not collected. |
| [ali-abassi/remotion-templates](https://github.com/ali-abassi/remotion-templates) | Referenced presets and author previews | No root license was found at the pinned revision; treat entries as reference-only and verify permission before reuse |

The presence of a preview does not mean that the effect has been ported to HyperFrames. The gallery labels Remotion, GLSL, and Web effects with their actual integration status.

Shotcraft's author videos are hosted separately from its Git source. Each downloaded MP4 has a URL, retrieval timestamp and SHA-256 receipt; the pinned source revision does not establish frame identity between the source and hosted video. The complete 214-preview inventory is accounted for in `assets/community/video-shotcraft/selection.json`: 178 included previews (173 additional primary cards and 5 alternatives), and 36 title/brand previews outside this gallery's scope. The small complete upstream recipe/demo kit is retained for accurate source navigation, including recipes outside the displayed selection.

## Atelier authored knowledge templates

`assets/atelier/knowledge/` contains independently authored templates and locally rendered examples. Concept inventory reference: [nutllwhy/hyperframes-motion-library](https://github.com/nutllwhy/hyperframes-motion-library), commit `fe59998fa3f2c8579ba5ddd00cbbb76131190bdb`, by 栗噔噔. No template code, example copy or media from that repository is redistributed in this collection. See `reference-map.json` for the 23-item coverage mapping. Our template code has its own MIT license in that directory; bundled GSAP keeps its upstream license header.
