import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NoiseGrainOverlay, clampInterp, seededRand } from "../lib/primitives";

/**
 * FAMILY: transitions
 * Ten full-screen, scene-to-scene handoffs. Each variant uses the same two
 * procedural scenes so the transition—not the placeholder artwork—is the hero.
 */

type TransitionVariant =
  | "horizontal-push"
  | "circular-iris"
  | "diagonal-slices"
  | "pixel-dissolve"
  | "clock-wipe"
  | "luma-sweep"
  | "zoom-through"
  | "venetian-blinds"
  | "shatter-panels"
  | "liquid-bars";

export interface TransitionProps {
  variant: TransitionVariant;
  sceneA: string;
  sceneB: string;
  accentColor: string;
  transitionPoint: number;
}

type SceneProps = { label: string; accent: string };
type VariantProps = {
  progress: number;
  sceneA: string;
  sceneB: string;
  accent: string;
};

const FONT_STACK = 'Inter, "Helvetica Neue", Arial, sans-serif';
const MONO_STACK = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

// ---------------- procedural source scenes ----------------
const SceneA: React.FC<SceneProps> = ({ label, accent }) => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        overflow: "hidden",
        background: "linear-gradient(135deg, #07101f 0%, #101a31 58%, #07101f 100%)",
        color: "#f7f9ff",
        fontFamily: FONT_STACK,
      }}
    >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.16,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
    />
    <div
      style={{
        position: "absolute",
        width: 760,
        height: 760,
        right: -190,
        top: -250,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}66 0%, ${accent}12 48%, transparent 70%)`,
      }}
    />
    <div style={{ position: "absolute", left: 112, right: 112, top: 72, display: "flex", alignItems: "center" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: accent, boxShadow: `0 0 28px ${accent}` }} />
      <div style={{ marginLeft: 16, fontFamily: MONO_STACK, fontSize: 18, letterSpacing: "0.2em", color: "#aebbd1" }}>ORBIT / 01</div>
      <div style={{ flex: 1, height: 1, marginLeft: 36, background: "rgba(255,255,255,.18)" }} />
      <div style={{ marginLeft: 28, fontFamily: MONO_STACK, fontSize: 16, color: "#8290a9" }}>SIGNAL ACTIVE</div>
    </div>

    <div style={{ position: "absolute", left: 112, top: 250, width: "calc(100% - 224px)", maxWidth: 980, height: 430, minWidth: 0, overflow: "hidden" }}>
      <div style={{ fontFamily: MONO_STACK, fontSize: "clamp(14px, 1.05vw, 20px)", lineHeight: 1.2, letterSpacing: "0.24em", color: accent, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Scene A · Field notes</div>
      <div style={{ marginTop: 26, maxWidth: "min(92%, 970px)", maxHeight: 170, overflow: "hidden", overflowWrap: "anywhere", fontSize: "clamp(48px, 4.6vw, 88px)", fontWeight: 760, letterSpacing: "-0.055em", lineHeight: 0.95 }}>{label}</div>
      <div style={{ marginTop: 28, width: "min(610px, 100%)", maxHeight: 92, overflow: "hidden", fontSize: "clamp(18px, 1.3vw, 25px)", lineHeight: 1.45, color: "#aebbd1" }}>A structured editorial scene with labeled content blocks and a quiet technical rhythm.</div>
    </div>

    <div style={{ position: "absolute", left: 112, right: 112, bottom: 78, display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: 22 }}>
      {["Trajectory", "Velocity", "Window"].map((title, i) => (
        <div key={title} style={{ height: 142, border: "1px solid rgba(255,255,255,.16)", borderRadius: 18, padding: "25px 28px", background: "rgba(7,16,31,.72)", boxShadow: "0 18px 60px rgba(0,0,0,.22)" }}>
          <div style={{ fontFamily: MONO_STACK, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.18em", color: "#7f8da5" }}>{`0${i + 1} / ${title}`}</div>
          <div style={{ marginTop: 17, display: "flex", alignItems: "end", gap: 14 }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{["48.2°", "1.8×", "06:24"][i]}</div>
            <div style={{ width: i === 0 ? 150 : 92, height: 5, marginBottom: 8, borderRadius: 99, background: accent, opacity: 0.85 }} />
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
  );
};

const SceneB: React.FC<SceneProps> = ({ label, accent }) => {
  const { width, height } = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        overflow: "hidden",
        background: "linear-gradient(125deg, #f5f0e6 0%, #ebe4d6 100%)",
        color: "#15171c",
        fontFamily: FONT_STACK,
      }}
    >
    <div style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", right: 55, top: 122, border: "2px solid rgba(21,23,28,.13)" }} />
    <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", right: 175, top: 242, background: accent, boxShadow: `0 42px 100px ${accent}44` }} />
    <div style={{ position: "absolute", width: 235, height: 235, borderRadius: "50%", right: 317, top: 385, background: "#15171c", border: "26px solid #f5f0e6" }} />
    <div style={{ position: "absolute", left: 92, right: 92, top: 64, display: "flex", alignItems: "center", borderBottom: "2px solid #15171c", paddingBottom: 22 }}>
      <div style={{ fontSize: 24, fontWeight: 850, letterSpacing: "-0.03em" }}>FORM / SECOND STATE</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: MONO_STACK, fontSize: 15, letterSpacing: "0.16em" }}>ARCHIVE 02 — 2026</div>
    </div>

    <div style={{ position: "absolute", left: 92, top: 220, width: "calc(100% - 184px)", maxWidth: 900, height: 430, minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "inline-block", maxWidth: "100%", padding: "10px 16px", borderRadius: 99, background: "#15171c", color: "#ffffff", fontFamily: MONO_STACK, fontSize: "clamp(12px, 0.78vw, 15px)", lineHeight: 1.2, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Scene B · New chapter</div>
      <div style={{ marginTop: 28, maxWidth: "min(88%, 780px)", maxHeight: 170, overflow: "hidden", overflowWrap: "anywhere", fontSize: "clamp(48px, 4.6vw, 88px)", fontWeight: 850, letterSpacing: "-0.065em", lineHeight: 0.9 }}>{label}</div>
      <div style={{ marginTop: 28, display: "flex", alignItems: "flex-start", gap: 20, maxWidth: "min(100%, 720px)" }}>
        <div style={{ flex: "0 0 92px", width: 92, height: 12, marginTop: 8, background: accent }} />
        <div style={{ maxWidth: 570, maxHeight: 90, overflow: "hidden", fontSize: "clamp(18px, 1.25vw, 24px)", lineHeight: 1.45 }}>A brighter geometric layout arrives with a new hierarchy, palette and visual tempo.</div>
      </div>
    </div>

    <div style={{ position: "absolute", left: 92, bottom: 64, display: "flex", gap: 14 }}>
      {["Shape", "Color", "Motion"].map((item, i) => (
        <div key={item} style={{ width: 168, padding: "17px 18px", borderTop: `5px solid ${i === 1 ? accent : "#15171c"}`, background: "rgba(255,255,255,.44)" }}>
          <div style={{ fontFamily: MONO_STACK, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase" }}>{item}</div>
          <div style={{ marginTop: 9, fontSize: 18, fontWeight: 750 }}>{["Radial", "Signal", "Forward"][i]}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", right: 92, bottom: 64, fontFamily: MONO_STACK, fontSize: 16, letterSpacing: "0.14em", writingMode: "vertical-rl" }}>A → B / COMPLETE</div>
    </AbsoluteFill>
  );
};

const A: React.FC<VariantProps> = ({ sceneA, accent }) => <SceneA label={sceneA} accent={accent} />;
const B: React.FC<VariantProps> = ({ sceneB, accent }) => <SceneB label={sceneB} accent={accent} />;

// ---------------- variant: horizontal push ----------------
const HorizontalPush: React.FC<VariantProps> = (p) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#07101f" }}>
      <AbsoluteFill style={{ transform: `translateX(${-p.progress * width}px)` }}><A {...p} /></AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${(1 - p.progress) * width}px)` }}><B {...p} /></AbsoluteFill>
      <div style={{ position: "absolute", left: (1 - p.progress) * width - 7, top: 0, bottom: 0, width: 14, background: p.accent, boxShadow: `0 0 50px ${p.accent}` }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: circular iris ----------------
const CircularIris: React.FC<VariantProps> = (p) => {
  const radius = interpolate(p.progress, [0, 1], [0, 82]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <A {...p} />
      <AbsoluteFill style={{ clipPath: `circle(${radius}vmax at 50% 50%)` }}><B {...p} /></AbsoluteFill>
      {p.progress > 0.015 && p.progress < 0.99 ? (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: `${radius * 2}vmax`, height: `${radius * 2}vmax`, borderRadius: "50%", border: `8px solid ${p.accent}`, transform: "translate(-50%, -50%)", boxShadow: `0 0 42px ${p.accent}99, inset 0 0 36px ${p.accent}55` }} />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- variant: diagonal slice cascade ----------------
const DiagonalSlices: React.FC<VariantProps> = (p) => {
  const count = 9;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#07101f" }}>
      <A {...p} />
      {Array.from({ length: count }, (_, i) => {
        const local = clampInterp(p.progress, [i * 0.045, 0.58 + i * 0.045], [0, 1]);
        const x0 = (i / count) * 100 - 3;
        const x1 = ((i + 1) / count) * 100 + 3;
        const y = (i % 2 === 0 ? -1 : 1) * (1 - local) * 118;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `polygon(${x0}% 0, ${x1}% 0, ${x1 - 7}% 100%, ${x0 - 7}% 100%)`, transform: `translateY(${y}%)` }}>
            <B {...p} />
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(105deg, transparent 44%, ${p.accent}55 50%, transparent 56%)`, transform: `translateX(${interpolate(p.progress, [0, 1], [-130, 130])}%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: seeded pixel-grid dissolve ----------------
const PixelDissolve: React.FC<VariantProps> = (p) => {
  const cols = 10;
  const rows = 6;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#07101f" }}>
      <A {...p} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const threshold = seededRand(i * 19 + 73) * 0.78;
        const local = clampInterp(p.progress, [threshold, threshold + 0.2], [0, 1]);
        const left = (col / cols) * 100;
        const right = 100 - ((col + 1) / cols) * 100;
        const top = (row / rows) * 100;
        const bottom = 100 - ((row + 1) / rows) * 100;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`, opacity: local, filter: local < 0.72 ? `brightness(${1.25 + (1 - local) * 1.8})` : undefined }}>
            <B {...p} />
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", inset: 0, opacity: clampInterp(p.progress, [0.2, 0.48, 0.82], [0, 0.16, 0]), backgroundImage: `linear-gradient(${p.accent} 2px, transparent 2px), linear-gradient(90deg, ${p.accent} 2px, transparent 2px)`, backgroundSize: `${100 / cols}% ${100 / rows}%`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: clock wipe ----------------
const ClockWipe: React.FC<VariantProps> = (p) => {
  const deg = Math.max(0.01, p.progress * 360);
  const angle = (deg - 90) * (Math.PI / 180);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <A {...p} />
      <AbsoluteFill
        style={{
          WebkitMaskImage: `conic-gradient(from -90deg at 50% 50%, #000 0deg, #000 ${deg}deg, transparent ${deg + 0.3}deg)`,
          maskImage: `conic-gradient(from -90deg at 50% 50%, #000 0deg, #000 ${deg}deg, transparent ${deg + 0.3}deg)`,
        }}
      >
        <B {...p} />
      </AbsoluteFill>
      {p.progress > 0.01 && p.progress < 0.995 ? (
        <>
          <div style={{ position: "absolute", left: "50%", top: "50%", width: "52vmax", height: 5, transformOrigin: "0 50%", transform: `rotate(${deg - 90}deg)`, background: `linear-gradient(90deg, ${p.accent}, transparent)`, boxShadow: `0 0 24px ${p.accent}` }} />
          <div style={{ position: "absolute", left: `calc(50% + ${Math.cos(angle) * 25}vmax)`, top: `calc(50% + ${Math.sin(angle) * 25}vmax)`, width: 18, height: 18, borderRadius: "50%", transform: "translate(-50%, -50%)", background: p.accent }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- variant: luma brightness sweep ----------------
const LumaSweep: React.FC<VariantProps> = (p) => {
  const edge = interpolate(p.progress, [0, 1], [-12, 112]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <A {...p} />
      <AbsoluteFill style={{ clipPath: `inset(0 ${Math.max(0, 100 - edge)}% 0 0)`, filter: `brightness(${1 + Math.sin(p.progress * Math.PI) * 0.25})` }}><B {...p} /></AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${edge - 17}%`, width: "34%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.12) 20%, rgba(255,255,255,.96) 50%, rgba(255,255,255,.12) 80%, transparent)", filter: "blur(8px)", mixBlendMode: "screen", opacity: p.progress > 0.015 && p.progress < 0.985 ? 1 : 0 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${edge}%`, width: 5, background: "#ffffff", boxShadow: `0 0 34px 12px ${p.accent}`, opacity: p.progress > 0.015 && p.progress < 0.985 ? 0.9 : 0 }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: zoom through center ----------------
const ZoomThrough: React.FC<VariantProps> = (p) => {
  const aScale = interpolate(p.progress, [0, 0.55, 1], [1, 1.25, 5.8]);
  const aOpacity = clampInterp(p.progress, [0.5, 0.78], [1, 0]);
  const bScale = interpolate(p.progress, [0, 0.56, 1], [0.16, 0.46, 1]);
  const bOpacity = clampInterp(p.progress, [0.22, 0.58], [0, 1]);
  const radius = interpolate(p.progress, [0.15, 1], [0, 82], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: p.accent, perspective: 1200 }}>
      <AbsoluteFill style={{ transform: `scale(${aScale})`, opacity: aOpacity, filter: `blur(${clampInterp(p.progress, [0.35, 0.8], [0, 9])}px)` }}><A {...p} /></AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${bScale})`, opacity: bOpacity, clipPath: `circle(${radius}vmax at 50% 50%)`, boxShadow: `0 0 90px ${p.accent}` }}><B {...p} /></AbsoluteFill>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: `${radius * 2}vmax`, height: `${radius * 2}vmax`, borderRadius: "50%", border: `5px solid ${p.accent}`, transform: "translate(-50%, -50%)", opacity: clampInterp(p.progress, [0.1, 0.3, 0.92, 1], [0, 1, 1, 0]) }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: venetian blinds ----------------
const VenetianBlinds: React.FC<VariantProps> = (p) => {
  const count = 12;
  return (
    <AbsoluteFill style={{ overflow: "hidden", perspective: 1200, background: "#07101f" }}>
      <A {...p} />
      {Array.from({ length: count }, (_, i) => {
        const local = clampInterp(p.progress, [i * 0.025, 0.7 + i * 0.025], [0, 1]);
        const left = (i / count) * 100;
        const right = 100 - ((i + 1) / count) * 100;
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(0 ${right}% 0 ${left}%)`, transformOrigin: `${left + (i % 2 === 0 ? 0 : 100 / count)}% 50%`, transform: `rotateY(${(1 - local) * (i % 2 === 0 ? -92 : 92)}deg)`, filter: `brightness(${0.55 + local * 0.45})`, backfaceVisibility: "hidden" }}>
            <B {...p} />
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, transparent 0, transparent calc(${100 / count}% - 2px), ${p.accent}66 calc(${100 / count}% - 1px), transparent ${100 / count}%)`, opacity: clampInterp(p.progress, [0.08, 0.48, 0.95], [0, 0.75, 0]) }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: shatter panels ----------------
const ShatterPanels: React.FC<VariantProps> = (p) => {
  const shards = Array.from({ length: 12 }, (_, i) => {
    const cell = Math.floor(i / 2);
    const col = cell % 3;
    const row = Math.floor(cell / 3);
    const x0 = (col / 3) * 100;
    const x1 = ((col + 1) / 3) * 100;
    const y0 = (row / 2) * 100;
    const y1 = ((row + 1) / 2) * 100;
    const clip = i % 2 === 0
      ? `polygon(${x0}% ${y0}%, ${x1}% ${y0}%, ${x1}% ${y1}%)`
      : `polygon(${x0}% ${y0}%, ${x1}% ${y1}%, ${x0}% ${y1}%)`;
    return { clip, seed: i * 37 + 11 };
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#ebe4d6" }}>
      <B {...p} />
      {shards.map((shard, i) => {
        const delay = seededRand(shard.seed) * 0.2;
        const local = clampInterp(p.progress, [delay, 0.72 + delay], [0, 1]);
        const angle = seededRand(shard.seed + 1) * Math.PI * 2;
        const distance = local * (52 + seededRand(shard.seed + 2) * 76);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const rotate = (seededRand(shard.seed + 3) - 0.5) * 42 * local;
        return (
          <AbsoluteFill key={i} style={{ clipPath: shard.clip, transform: `translate(${x}vw, ${y}vh) rotate(${rotate}deg) scale(${1 - local * 0.08})`, filter: `drop-shadow(0 16px 18px rgba(0,0,0,${0.25 * local}))` }}>
            <A {...p} />
          </AbsoluteFill>
        );
      })}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${p.accent}aa 0%, transparent 34%)`, mixBlendMode: "screen", opacity: clampInterp(p.progress, [0.05, 0.28, 0.65], [0, 0.7, 0]) }} />
    </AbsoluteFill>
  );
};

// ---------------- variant: liquid morph bars ----------------
const LiquidBars: React.FC<VariantProps> = (p) => {
  const { width } = useVideoConfig();
  const count = 8;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#07101f" }}>
      <A {...p} />
      {Array.from({ length: count }, (_, i) => {
        const wave = Math.sin((i / (count - 1)) * Math.PI) * 0.14;
        const local = clampInterp(p.progress, [0.02 + wave, 0.8 + wave], [0, 1]);
        const top = Math.max(0, (i / count) * 100 - 0.5);
        const bottom = Math.max(0, 100 - ((i + 1) / count) * 100 - 0.5);
        const x = (1 - local) * -(width * (1.06 + seededRand(i + 50) * 0.1));
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}% -1% ${bottom}% -1% round ${i % 2 === 0 ? 90 : 54}px)`, transform: `translateX(${x}px)` }}>
            <B {...p} />
          </AbsoluteFill>
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const local = clampInterp(p.progress, [0.05 + i * 0.025, 0.84 + i * 0.025], [0, 1]);
        const size = 34 + seededRand(i + 91) * 76;
        return <div key={i} style={{ position: "absolute", left: local * 108 - 8 + Math.sin(i * 2.2) * 3 + "%", top: 10 + i * 15 + "%", width: size, height: size, borderRadius: "50%", background: i % 2 === 0 ? p.accent : "#f5f0e6", transform: "translate(-50%, -50%)", boxShadow: `0 0 30px ${p.accent}55`, opacity: clampInterp(local, [0, 0.1, 0.92, 1], [0, 1, 1, 0]) }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------------- dispatcher ----------------
const VARIANTS: Record<TransitionVariant, React.FC<VariantProps>> = {
  "horizontal-push": HorizontalPush,
  "circular-iris": CircularIris,
  "diagonal-slices": DiagonalSlices,
  "pixel-dissolve": PixelDissolve,
  "clock-wipe": ClockWipe,
  "luma-sweep": LumaSweep,
  "zoom-through": ZoomThrough,
  "venetian-blinds": VenetianBlinds,
  "shatter-panels": ShatterPanels,
  "liquid-bars": LiquidBars,
};

export const TransitionTemplate: React.FC<TransitionProps> = ({
  variant = "horizontal-push",
  sceneA = "Signals in motion",
  sceneB = "A new perspective",
  accentColor = "#ff4d8d",
  transitionPoint = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const point = Math.min(0.82, Math.max(0.18, transitionPoint));
  const transitionFrames = Math.max(22, durationInFrames * 0.36);
  const center = point * (durationInFrames - 1);
  const raw = clampInterp(frame, [center - transitionFrames / 2, center + transitionFrames / 2], [0, 1]);
  const progress = Easing.bezier(0.76, 0, 0.24, 1)(raw);
  const Variant = VARIANTS[variant] ?? HorizontalPush;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#07101f" }}>
      <Variant progress={progress} sceneA={sceneA} sceneB={sceneB} accent={accentColor} />
      <NoiseGrainOverlay opacity={0.035} />
    </AbsoluteFill>
  );
};

const familyCast = (c: React.FC<TransitionProps>) => c as unknown as React.ComponentType<Record<string, unknown>>;

export const FAMILY_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "transition-horizontal-push": familyCast(TransitionTemplate),
  "transition-circular-iris": familyCast(TransitionTemplate),
  "transition-diagonal-slices": familyCast(TransitionTemplate),
  "transition-pixel-dissolve": familyCast(TransitionTemplate),
  "transition-clock-wipe": familyCast(TransitionTemplate),
  "transition-luma-sweep": familyCast(TransitionTemplate),
  "transition-zoom-through": familyCast(TransitionTemplate),
  "transition-venetian-blinds": familyCast(TransitionTemplate),
  "transition-shatter-panels": familyCast(TransitionTemplate),
  "transition-liquid-bars": familyCast(TransitionTemplate),
};
