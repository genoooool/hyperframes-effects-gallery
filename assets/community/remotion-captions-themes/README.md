# remotion-captions-themes

A Remotion package containing a suite of beautiful, modern, and highly interactive caption themes. Ideal for social media reels, TikToks, YouTube shorts, and video editing pipelines.

<video src="https://github.com/user-attachments/assets/36080fb9-6677-427c-b66b-57ed05612ea4" controls="controls" muted="muted" playsinline="playsinline" width="100%"></video>

*Note: This preview video is heavily compressed for fast loading on GitHub. The actual rendered animations are crystal clear and smooth.*

## Installation

```bash
npm install remotion-captions-themes
```

Note: This package requires `remotion`, `react`, and `react-dom` as peer dependencies.

## Usage

Import the `<CaptionTheme />` component and pass the required structured word-level captions JSON:

```tsx
import { CaptionTheme } from "remotion-captions-themes";

const MyComposition = () => {
  const captionsData = {
    lines: [
      {
        words: [
          { text: "Hello", start: 0.0, end: 0.5 },
          { text: "world!", start: 0.5, end: 1.0 }
        ]
      }
    ]
  };

  return (
    <CaptionTheme
      data={captionsData}
      theme="kinetic-01"
      primaryColor="#FFFFFF"
      secondaryColor="#FFD700"
      fontSize={72}
    />
  );
};
```

## API Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `CaptionsData` (required) | - | Structured line/word timing JSON |
| `theme` | `ThemeName` (optional) | `"pop"` | Name of the theme to apply |
| `primaryColor` | `string` (optional) | `"#FFFFFF"` | Base color for inactive/spoken words |
| `secondaryColor` | `string` (optional) | `"#FFFFFF"` | Accent color for the active spoken word |
| `fontSize` | `number \| string` (optional)| `72` | Responsive base font size (automatically scales with video width) |

## Available Themes (`ThemeName`)

- `"pop"`: Clean popup animation with scaling and bounce.
- `"karaoke"`: Smooth karaoke-style highlight sweep.
- `"hustle"`: Energetic, fast-paced kinetic entrance.
- `"grape"`: Rounded purple/accent boxed caption style.
- `"beast"`: Official bold highlighted style with high-contrast shadows.
- `"poppin"`: Vibrant uppercase Poppins font theme.
- `"aarit"`: Cinematic letter-by-letter zoom and gradient sweep.
- `"soft-ai"`: Frosted glass and blur-in caption typography.
- `"gaming-stream"`: Neon glowing gaming typography.
- `"simple-one-word"`: Clean, single-word focal-point highlight.
- `"kinetic-01"`: Advanced layout-calculated kinetic typography. Highlights a primary "main" word, aligns "side" words recursively without overlap using target anchors, supports filler word separation, and alternates between slide, fade, and blur animations.

## License

MIT
