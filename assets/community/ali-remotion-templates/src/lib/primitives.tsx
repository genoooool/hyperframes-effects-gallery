import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ---------- palette ----------
export interface Palette {
  bg: string;
  bgAlt?: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted?: string;
}

export const PALETTES: Record<string, Palette> = {
  midnight: { bg: "#0a0a12", primary: "#7c5cff", secondary: "#00e0ff", accent: "#ff3d81", text: "#ffffff" },
  sunset: { bg: "#1a0b2e", primary: "#ff6b35", secondary: "#f7c59f", accent: "#ff3d81", text: "#fff8f0" },
  forest: { bg: "#07130c", primary: "#34d399", secondary: "#a7f3d0", accent: "#fbbf24", text: "#ecfdf5" },
  ocean: { bg: "#04121f", primary: "#38bdf8", secondary: "#7dd3fc", accent: "#fb7185", text: "#f0f9ff" },
  paper: { bg: "#faf7f2", primary: "#1a1a1a", secondary: "#8a8577", accent: "#c24502", text: "#141414" },
  mono: { bg: "#0d0d0d", primary: "#ffffff", secondary: "#888888", accent: "#ffd400", text: "#ffffff" },
  candy: { bg: "#12081f", primary: "#e879f9", secondary: "#67e8f9", accent: "#fde047", text: "#fdf4ff" },
};

export const paletteNames = Object.keys(PALETTES);
export const resolvePalette = (nameOrPalette: string | Palette): Palette =>
  typeof nameOrPalette === "string" ? (PALETTES[nameOrPalette] ?? PALETTES.midnight) : nameOrPalette;

// ---------- easing / timing helpers ----------
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeInOutQuint = [0.83, 0, 0.17, 1] as const;

export const clampInterp = (
  frame: number,
  range: readonly number[],
  out: readonly number[],
): number => interpolate(frame, range as number[], out as number[], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Staggered entrance window for item i of n across duration. */
export const stagger = (i: number, n: number, start: number, end: number): [number, number] => {
  const span = (end - start) / Math.max(1, n);
  return [start + i * span, start + i * span + span * 0.7];
};

/** Deterministic pseudo-random from integer seed (stable renders). */
export const seededRand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- global fade in/out wrapper ----------
export const FadeEdges: React.FC<{
  children: React.ReactNode;
  inFrames?: number;
  outFrames?: number;
}> = ({ children, inFrames = 10, outFrames = 12 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(
    clampInterp(frame, [0, inFrames], [0, 1]),
    clampInterp(frame, [durationInFrames - outFrames, durationInFrames], [1, 0]),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ---------- animated backgrounds ----------
export const GradientMeshBackground: React.FC<{
  palette: Palette;
  speed?: number;
  blobs?: number;
}> = ({ palette, speed = 1, blobs = 5 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg }}>
      {Array.from({ length: blobs }, (_, i) => {
        const r1 = seededRand(i * 3 + 1);
        const r2 = seededRand(i * 3 + 2);
        const r3 = seededRand(i * 3 + 3);
        const t = frame * 0.012 * speed;
        const x = 50 + Math.sin(t + i * 2.1) * (18 + r1 * 20);
        const y = 50 + Math.cos(t * 0.8 + i * 1.7) * (14 + r2 * 22);
        const size = 40 + r3 * 35;
        const colors = [palette.primary, palette.secondary, palette.accent];
        return (
          <div
            key={`blob-${i}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}vmax`,
              height: `${size}vmax`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors[i % colors.length]}44 0%, transparent 65%)`,
              transform: "translate(-50%, -50%)",
              filter: "blur(60px)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${palette.bg}cc 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const GridPerspectiveBackground: React.FC<{ palette: Palette }> = ({ palette }) => {
  const frame = useCurrentFrame();
  const rows = 14;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "-50%",
          right: "-50%",
          top: "45%",
          bottom: "-30%",
          transform: "perspective(600px) rotateX(62deg)",
          transformOrigin: "top center",
        }}
      >
        {Array.from({ length: rows }, (_, i) => {
          const z = ((i * 60 + frame * 4) % (rows * 60)) / (rows * 60);
          return (
            <div
              key={`row-${i}`}
              style={{
                position: "absolute",
                top: `${z * 100}%`,
                left: 0,
                right: 0,
                height: 2,
                background: palette.primary,
                opacity: z * 0.5,
              }}
            />
          );
        })}
        {Array.from({ length: 21 }, (_, i) => (
          <div
            key={`col-${i}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(i / 20) * 100}%`,
              width: 2,
              background: palette.primary,
              opacity: 0.15,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${palette.bg}, transparent 50%, ${palette.bg})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const NoiseGrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ opacity }}
      // deterministic per-frame grain pattern
    >
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 100} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5" />
      </svg>
    </AbsoluteFill>
  );
};
