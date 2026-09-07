import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  FadeEdges,
  GradientMeshBackground,
  NoiseGrainOverlay,
  clampInterp,
  resolvePalette,
  seededRand,
  type Palette,
} from "../lib/primitives";

/**
 * FAMILY: accessibility-captions
 * Production-ready caption treatments with deterministic timing and safe-area
 * aware defaults. Every variant works without footage or an audio track.
 */
export type AccessibilityCaptionsVariant =
  | "high-contrast-captions"
  | "speaker-captions"
  | "karaoke-captions"
  | "caption-box"
  | "caption-highlight"
  | "descriptive-card"
  | "sign-language-space"
  | "audio-description-card"
  | "large-type-captions"
  | "caption-endcard";

export interface CaptionSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string;
  description?: string;
}

export interface CaptionWord {
  text: string;
  start: number;
  end: number;
}

export interface AccessibilityCaptionsProps {
  variant: AccessibilityCaptionsVariant;
  transcript: string;
  segments: CaptionSegment[];
  wordTimings: CaptionWord[];
  speaker: string;
  speakerRole: string;
  description: string;
  signLanguageLabel: string;
  language: string;
  captionPosition: "top" | "center" | "bottom";
  contrastMode: "dark" | "light" | "yellow";
  safeArea: number;
  paletteName: string;
  showProgress: boolean;
  showSpeaker: boolean;
}

type VariantProps = { p: AccessibilityCaptionsProps; pal: Palette };
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const defaultSegments = (p: AccessibilityCaptionsProps): CaptionSegment[] =>
  p.segments?.length
    ? p.segments
    : [
        { text: p.transcript || "Design should be clear for everyone.", start: 0, end: 44, speaker: p.speaker },
        { text: "Readable captions make every story easier to follow.", start: 44, end: 88, speaker: p.speaker },
        { text: "Every voice belongs in the frame.", start: 88, end: 132, speaker: p.speaker },
      ];

const wordsFor = (p: AccessibilityCaptionsProps, text: string): CaptionWord[] => {
  if (p.wordTimings?.length) return p.wordTimings;
  const words = text.split(/\s+/).filter(Boolean);
  return words.map((word, i) => ({ text: word, start: i * 5, end: i * 5 + 9 }));
};

const activeSegment = (p: AccessibilityCaptionsProps, frame: number): CaptionSegment => {
  const list = defaultSegments(p);
  return list.find((segment) => frame >= segment.start && frame < segment.end) ?? list[Math.min(list.length - 1, Math.floor(frame / 44))] ?? list[0];
};

const progressFor = (p: AccessibilityCaptionsProps, frame: number): number => {
  const list = defaultSegments(p);
  const first = list[0]?.start ?? 0;
  const last = list[list.length - 1]?.end ?? 1;
  return clampInterp(frame, [first, Math.max(first + 1, last)], [0, 1]);
};

const positionStyle = (position: AccessibilityCaptionsProps["captionPosition"], safe: number): React.CSSProperties =>
  position === "top"
    ? { top: safe }
    : position === "center"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { bottom: safe };

const contrastColors = (p: AccessibilityCaptionsProps, pal: Palette) => {
  if (p.contrastMode === "light") return { fill: pal.text, ink: pal.bg, highlight: pal.accent };
  if (p.contrastMode === "yellow") return { fill: "#111111", ink: "#fff200", highlight: "#ffffff" };
  return { fill: "#050505", ink: "#ffffff", highlight: pal.secondary };
};

const ProgressRail: React.FC<{ p: AccessibilityCaptionsProps; pal: Palette; dark?: boolean }> = ({ p, pal, dark = false }) => {
  if (!p.showProgress) return null;
  const frame = useCurrentFrame();
  const progress = progressFor(p, frame);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 7, background: `${dark ? "#000" : pal.text}35` }}>
      <div style={{ width: `${progress * 100}%`, height: "100%", background: pal.accent, boxShadow: `0 0 16px ${pal.accent}` }} />
    </div>
  );
};

const SpeakerBadge: React.FC<{ name: string; role: string; pal: Palette; dark?: boolean }> = ({ name, role, pal, dark = false }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 14px 9px 10px", borderRadius: 999, color: dark ? pal.bg : pal.text, background: dark ? pal.text : `${pal.bg}e8`, border: `2px solid ${dark ? pal.bg : pal.text}35`, fontFamily: FONT }}>
    <div style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", color: pal.bg, background: pal.accent, fontSize: 16, fontWeight: 950 }}>{(name || "S").slice(0, 1).toUpperCase()}</div>
    <div><div style={{ fontSize: 17, lineHeight: 1, fontWeight: 900 }}>{name || "Speaker"}</div><div style={{ marginTop: 4, fontSize: 12, opacity: .66, letterSpacing: ".08em", textTransform: "uppercase" }}>{role || "Voice"}</div></div>
  </div>
);

const CaptionPill: React.FC<{ text: string; p: AccessibilityCaptionsProps; pal: Palette; size?: number; dark?: boolean }> = ({ text, p, pal, size = 38, dark = false }) => {
  const colors = contrastColors(p, pal);
  return <div style={{ maxWidth: "100%", padding: "14px 23px 16px", borderRadius: 14, background: dark ? pal.text : colors.fill, color: dark ? pal.bg : colors.ink, border: `3px solid ${dark ? pal.bg : colors.ink}25`, boxShadow: `0 16px 40px ${pal.bg}70`, fontFamily: FONT, fontSize: size, lineHeight: 1.08, fontWeight: 900, letterSpacing: "-0.025em", textAlign: "center" }}>{text}</div>;
};

const HighContrast: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const colors = contrastColors(p, pal);
  const enter = clampInterp(frame, [segment.start, segment.start + 8], [0, 1]);
  return <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(140deg, ${pal.bg}, ${pal.primary}55)` }} />
    <div style={{ position: "relative", width: "86%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px)` }}>
      <div style={{ alignSelf: "flex-start", color: pal.accent, font: `800 16px ${MONO}`, letterSpacing: ".2em" }}>CAPTIONS / {p.language.toUpperCase()}</div>
      <div style={{ padding: "22px 28px", width: "100%", boxSizing: "border-box", borderRadius: 16, background: colors.fill, color: colors.ink, border: `4px solid ${colors.highlight}`, boxShadow: `0 18px 46px #0009`, fontSize: "clamp(32px, 5vw, 68px)", lineHeight: 1.05, fontWeight: 950, textAlign: "center" }}>{segment.text}</div>
      <div style={{ color: `${pal.text}bb`, fontSize: 17, letterSpacing: ".1em", textTransform: "uppercase" }}>High contrast • readable at a glance</div>
    </div>
    <ProgressRail p={p} pal={pal} dark />
  </AbsoluteFill>;
};

const SpeakerCaptions: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const name = segment.speaker || p.speaker;
  return <AbsoluteFill style={{ padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 25%, ${pal.primary}88, transparent 42%), ${pal.bg}` }} />
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: p.captionPosition === "top" ? "flex-start" : p.captionPosition === "center" ? "center" : "flex-end", alignItems: "flex-start", gap: 14 }}>
      {p.showSpeaker && <SpeakerBadge name={name} role={p.speakerRole} pal={pal} />}
      <CaptionPill text={segment.text} p={p} pal={pal} size={40} />
      <div style={{ color: `${pal.text}9e`, font: `700 15px ${MONO}`, letterSpacing: ".12em" }}>SPEAKER-LABELED CAPTION</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const KaraokeCaptions: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const words = wordsFor(p, segment.text);
  const localFrame = frame - segment.start;
  const colors = contrastColors(p, pal);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${pal.bg}, ${pal.secondary}18 50%, ${pal.primary}44)` }} />
    <div style={{ position: "relative", width: "87%", padding: "28px 30px", borderRadius: 22, background: `${colors.fill}f5`, border: `2px solid ${colors.highlight}99`, boxShadow: `0 22px 60px #0009` }}>
      <div style={{ marginBottom: 18, color: pal.accent, font: `800 15px ${MONO}`, letterSpacing: ".18em" }}>KARAOKE / {p.language.toUpperCase()}</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 14px" }}>
        {words.map((word, i) => {
          const active = clampInterp(localFrame, [word.start, word.end], [0, 1]);
          return <span key={`${word.text}-${i}`} style={{ color: colors.ink, fontSize: "clamp(31px, 4.7vw, 62px)", lineHeight: 1, fontWeight: 950, textShadow: `0 0 18px ${pal.accent}00`, background: `linear-gradient(90deg, ${colors.highlight} ${active * 100}%, transparent ${active * 100}%)`, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: active > .05 ? "transparent" : colors.ink }}>{word.text}</span>;
        })}
      </div>
    </div>
    <ProgressRail p={p} pal={pal} dark />
  </AbsoluteFill>;
};

const CaptionBox: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const lines = segment.text.length > 52 ? segment.text.match(/.{1,40}(?:\s|$)/g)?.map((line) => line.trim()) ?? [segment.text] : [segment.text];
  return <AbsoluteFill style={{ padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${pal.primary}77, ${pal.bg} 66%)` }} />
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: p.captionPosition === "top" ? "flex-start" : p.captionPosition === "center" ? "center" : "flex-end", alignItems: "center", gap: 18 }}>
      <div style={{ alignSelf: "flex-start", color: `${pal.text}9e`, font: `700 15px ${MONO}`, letterSpacing: ".16em" }}>OPEN CAPTION</div>
      <div style={{ maxWidth: "92%", padding: "25px 32px 28px", borderRadius: 20, background: `${pal.bg}ed`, border: `3px solid ${pal.text}55`, boxShadow: `0 20px 55px #0009`, textAlign: "center", color: pal.text, fontSize: "clamp(30px, 4.3vw, 59px)", lineHeight: 1.12, fontWeight: 780 }}>{lines.map((line, i) => <div key={i}>{line}</div>)}</div>
      <div style={{ color: pal.accent, font: `800 14px ${MONO}`, letterSpacing: ".14em" }}>{p.showSpeaker ? `${p.speaker.toUpperCase()} · ` : ""}MULTI-LINE SAFE WRAP</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const CaptionHighlight: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const words = segment.text.split(/\s+/).filter(Boolean);
  const active = Math.floor(clampInterp(frame, [segment.start, Math.max(segment.start + 1, segment.end)], [0, words.length]));
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: pal.bg }} />
    <div style={{ position: "relative", width: "86%", textAlign: "center" }}>
      <div style={{ color: pal.accent, font: `800 15px ${MONO}`, letterSpacing: ".2em", marginBottom: 30 }}>WORD HIGHLIGHT</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 18px" }}>{words.map((word, i) => <span key={`${word}-${i}`} style={{ padding: "7px 12px", borderRadius: 10, color: i <= active ? pal.bg : pal.text, background: i <= active ? pal.accent : `${pal.text}16`, border: `2px solid ${i <= active ? pal.accent : pal.text}35`, fontSize: "clamp(30px, 4.6vw, 64px)", fontWeight: 950, lineHeight: 1 }}>{word}</span>)}</div>
      <div style={{ marginTop: 32, color: `${pal.text}80`, fontSize: 18 }}>One spoken thought at a time</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const DescriptiveCard: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const description = segment.description || p.description;
  const reveal = clampInterp(frame, [segment.start, segment.start + 14], [0, 1]);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 25% 25%, ${pal.secondary}44, transparent 35%), ${pal.bg}` }} />
    <div style={{ position: "relative", width: "82%", padding: 34, borderRadius: 24, background: `${pal.bg}ef`, border: `3px solid ${pal.secondary}`, boxShadow: `0 24px 70px #0009`, opacity: reveal, transform: `translateY(${interpolate(reveal, [0, 1], [35, 0])}px)` }}>
      <div style={{ color: pal.secondary, font: `900 16px ${MONO}`, letterSpacing: ".18em" }}>VISUAL DESCRIPTION</div>
      <div style={{ marginTop: 22, color: pal.text, fontSize: "clamp(26px, 3.7vw, 48px)", lineHeight: 1.2, fontWeight: 760 }}>{description}</div>
      <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${pal.text}33`, color: `${pal.text}9e`, fontSize: 21 }}>{segment.text}</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const SignLanguageSpace: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const reveal = clampInterp(frame, [segment.start, segment.start + 12], [0, 1]);
  return <AbsoluteFill style={{ padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(120deg, ${pal.bg}, ${pal.primary}66)` }} />
    <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", gap: 26, opacity: reveal, flexDirection: "row" }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: pal.accent, font: `800 15px ${MONO}`, letterSpacing: ".15em", marginBottom: 18 }}>CAPTION TRACK</div><CaptionPill text={segment.text} p={p} pal={pal} size={34} /></div>
      <div style={{ width: "37%", height: "58%", borderRadius: 20, background: `${pal.bg}bb`, border: `3px dashed ${pal.secondary}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20, boxSizing: "border-box" }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", border: `5px solid ${pal.secondary}`, display: "grid", placeItems: "center", color: pal.secondary, fontSize: 44, fontWeight: 900 }}>ASL</div>
        <div style={{ marginTop: 18, color: pal.text, fontSize: 20, fontWeight: 850 }}>{p.signLanguageLabel}</div>
        <div style={{ marginTop: 9, color: `${pal.text}8c`, font: `700 13px ${MONO}` }}>INTERPRETER SAFE SPACE</div>
      </div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const AudioDescriptionCard: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const bars = Array.from({ length: 28 }, (_, i) => 12 + seededRand(i + 41) * 45);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${pal.bg}, ${pal.secondary}20)` }} />
    <div style={{ position: "relative", width: "84%", padding: 32, borderRadius: 24, background: `${pal.bg}ee`, border: `2px solid ${pal.accent}99`, boxShadow: `0 22px 65px #0009` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: pal.accent, font: `800 16px ${MONO}`, letterSpacing: ".14em" }}><span>AUDIO DESCRIPTION</span><span>AD / {p.language.toUpperCase()}</span></div>
      <div style={{ display: "flex", alignItems: "end", gap: 5, height: 70, marginTop: 25, padding: "0 10px", borderBottom: `2px solid ${pal.text}35` }}>{bars.map((bar, i) => <div key={i} style={{ flex: 1, height: bar * (.55 + .45 * Math.abs(Math.sin(frame * .09 + i))), borderRadius: 5, background: i < (frame % 28) ? pal.secondary : `${pal.text}45` }} />)}</div>
      <div style={{ marginTop: 26, color: pal.text, fontSize: "clamp(26px, 3.7vw, 48px)", lineHeight: 1.18, fontWeight: 820 }}>{segment.description || p.description}</div>
      <div style={{ marginTop: 17, color: `${pal.text}85`, fontSize: 18 }}>Non-dialogue context is carried in a separate, readable track.</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const LargeTypeCaptions: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const segment = activeSegment(p, frame);
  const enter = clampInterp(frame, [segment.start, segment.start + 10], [0, 1]);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT, background: pal.text }}>
    <div style={{ position: "relative", width: "88%", color: pal.bg, opacity: enter, transform: `scale(${interpolate(enter, [0, 1], [.94, 1])})` }}>
      <div style={{ color: pal.accent, font: `900 16px ${MONO}`, letterSpacing: ".2em", marginBottom: 26 }}>LARGE TYPE / {p.language.toUpperCase()}</div>
      <div style={{ fontSize: "clamp(47px, 8vw, 118px)", lineHeight: .96, fontWeight: 950, letterSpacing: "-0.06em", overflowWrap: "anywhere" }}>{segment.text}</div>
      <div style={{ width: "35%", height: 9, marginTop: 30, background: pal.accent }} />
      <div style={{ marginTop: 24, color: `${pal.bg}99`, fontSize: 18, fontWeight: 800 }}>Readable from a distance · reduced-motion friendly</div>
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const CaptionEndcard: React.FC<VariantProps> = ({ p, pal }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Keep the end card legible in catalog stills as well as in the final beat.
  // A 55% thumbnail frame lands well before the last 38 frames, so the old
  // entrance left the composition as an empty background for most previews.
  const entranceStart = Math.max(0, durationInFrames - 96);
  const entranceEnd = Math.max(entranceStart + 1, durationInFrames - 60);
  const enter = clampInterp(frame, [entranceStart, entranceEnd], [0, 1]);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: p.safeArea, boxSizing: "border-box", fontFamily: FONT }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 35%, ${pal.primary}99, transparent 55%), ${pal.bg}` }} />
    <div style={{ position: "relative", width: "82%", textAlign: "center", opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px)` }}>
      <div style={{ color: pal.accent, font: `900 17px ${MONO}`, letterSpacing: ".2em" }}>CAPTION END CARD</div>
      <div style={{ marginTop: 25, color: pal.text, fontSize: "clamp(34px, 5vw, 72px)", lineHeight: 1.05, fontWeight: 940 }}>{p.transcript || "Thanks for watching."}</div>
      <div style={{ marginTop: 28, color: `${pal.text}a5`, fontSize: 20 }}>Captions available · {p.language}</div>
      <div style={{ margin: "38px auto 0", width: 70, height: 7, background: pal.accent, borderRadius: 99 }} />
    </div>
    <ProgressRail p={p} pal={pal} />
  </AbsoluteFill>;
};

const VARIANTS: Record<AccessibilityCaptionsVariant, React.FC<VariantProps>> = {
  "high-contrast-captions": HighContrast,
  "speaker-captions": SpeakerCaptions,
  "karaoke-captions": KaraokeCaptions,
  "caption-box": CaptionBox,
  "caption-highlight": CaptionHighlight,
  "descriptive-card": DescriptiveCard,
  "sign-language-space": SignLanguageSpace,
  "audio-description-card": AudioDescriptionCard,
  "large-type-captions": LargeTypeCaptions,
  "caption-endcard": CaptionEndcard,
};

export const AccessibilityCaptionsTemplate: React.FC<AccessibilityCaptionsProps> = (props) => {
  const pal = resolvePalette(props.paletteName);
  const Variant = VARIANTS[props.variant] ?? HighContrast;
  return <AbsoluteFill style={{ backgroundColor: pal.bg, overflow: "hidden" }}><GradientMeshBackground palette={pal} speed={0.22} blobs={3} /><FadeEdges inFrames={8} outFrames={10}><Variant p={props} pal={pal} /></FadeEdges><NoiseGrainOverlay opacity={0.025} /></AbsoluteFill>;
};

const familyCast = (component: React.FC<AccessibilityCaptionsProps>) => component as unknown as React.ComponentType<Record<string, unknown>>;
export const FAMILY_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "accessibility-captions-high-contrast-captions": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-speaker-captions": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-karaoke-captions": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-caption-box": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-caption-highlight": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-descriptive-card": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-sign-language-space": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-audio-description-card": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-large-type-captions": familyCast(AccessibilityCaptionsTemplate),
  "accessibility-captions-caption-endcard": familyCast(AccessibilityCaptionsTemplate),
};
