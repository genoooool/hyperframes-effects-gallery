import React, { useState } from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill } from "remotion";
import { CaptionTheme, CaptionsData } from "../../src";
import { sampleCaptions } from "./sample-captions";

const VideoComposition: React.FC<{
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  data: CaptionsData;
  fontSize: number;
}> = ({ theme, primaryColor, secondaryColor, data, fontSize }) => {
  return (
    <AbsoluteFill
      style={{
        background: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CaptionTheme
        theme={theme}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        data={data}
        fontSize={fontSize}
      />
    </AbsoluteFill>
  );
};

export default function App() {
  const [theme, setTheme] = useState<string>("pop");
  const [primaryColor, setPrimaryColor] = useState<string>("#FFFFFF");
  const [secondaryColor, setSecondaryColor] = useState<string>("#FFD700");
  const [fontSize, setFontSize] = useState<number>(72);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Player Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "16/9",
          background: "#000000",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
        }}
      >
        <Player
          component={VideoComposition}
          inputProps={{
            theme,
            primaryColor,
            secondaryColor,
            data: sampleCaptions,
            fontSize,
          }}
          durationInFrames={490}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls
          loop
        />
      </div>

      {/* Simplified Minimal Controls Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          background: "#000000",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Style Dropdown & Size Slider Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {/* Style Selector */}
          <div style={{ flex: "1 1 250px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#a1a5b0", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Caption Style
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "6px",
                background: "#111111",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="pop">✨ Pop Theme</option>
              <option value="karaoke">🎤 Karaoke Theme</option>
              <option value="hustle">⚡ Hustle Theme</option>
              <option value="grape">🍇 Grape Boxed Theme</option>
              <option value="beast">🦁 MrBeast Bold Theme</option>
              <option value="poppin">💥 Poppins Bold Theme</option>
              <option value="aarit">🎬 Aarit Theme</option>
              <option value="soft-ai">❄️ Soft AI Blur Theme</option>
              <option value="gaming-stream">🎮 Gaming Stream Glow Theme</option>
              <option value="simple-one-word">🔤 Simple One Word Theme</option>
              <option value="kinetic-01">📐 Kinetic 01 (Boilerplate)</option>
              <option value="kinetic-02">📏 Kinetic 02 (Boilerplate)</option>
              <option value="podcast">🎤 Podcast Theme</option>

            </select>
          </div>

          {/* Size Slider */}
          <div style={{ flex: "1 1 250px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ color: "#a1a5b0", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Font Size
              </label>
              <span style={{ color: "#ffffff", fontSize: "0.85rem", fontWeight: 600 }}>{fontSize}px</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min="20"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#ffffff",
                  height: "5px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>

        {/* Color Selectors Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {/* Primary Color */}
          <div style={{ flex: "1 1 250px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#a1a5b0", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Primary Color
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: "transparent",
                  padding: 0,
                }}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#111111",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div style={{ flex: "1 1 250px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#a1a5b0", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Secondary Color
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: "transparent",
                  padding: 0,
                }}
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: "#111111",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
