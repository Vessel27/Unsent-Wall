import { useState } from "react";
import { EMOTION_BACKGROUNDS, STICKY_COLORS, buildWallStyle } from "../lib/wallThemes";
import { FontAwesomeIcon, faTimes } from "../lib/faIcons";

export default function EmotionBgPicker({ current, onChange, onClose }) {
  const [hovered, setHovered] = useState(null);
  const preview = hovered || current;
  const previewStyle = preview ? buildWallStyle(preview) : {};

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "rgba(10,8,20,0.97)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", width: "min(620px,96vw)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,0.8)" }}>
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "Georgia,serif" }}>how are you feeling?</h3>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>the wall will reflect your emotion</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FontAwesomeIcon icon={faTimes} style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }} />
            </button>
          </div>

          <div style={{ marginTop: 14, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", height: 80, position: "relative", transition: "all 0.4s ease", ...previewStyle }}>
            {[{ l: "6%", t: "15%", r: -2, c: 0 }, { l: "28%", t: "8%", r: 1.5, c: 2 }, { l: "50%", t: "18%", r: -1, c: 4 }, { l: "70%", t: "5%", r: 2, c: 1 }, { l: "86%", t: "14%", r: -1.5, c: 5 }].map((p, i) => (
              <div key={i} style={{ position: "absolute", left: p.l, top: p.t, width: 32, height: 26, background: STICKY_COLORS[p.c].bg, borderRadius: "1px 5px 5px 1px", transform: `rotate(${p.r}deg)`, boxShadow: "1px 2px 6px rgba(0,0,0,0.4)", opacity: 0.92 }}>
                <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 14, height: 7, background: "rgba(255,255,255,0.6)", borderRadius: 2 }} />
              </div>
            ))}
            {preview && (
              <div style={{ position: "absolute", bottom: 8, right: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 16 }}>{preview.emoji}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", fontStyle: "italic" }}>{preview.desc}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "14px 20px 20px", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
            {EMOTION_BACKGROUNDS.map(em => {
              const isActive = current?.id === em.id;
              const wallSt = buildWallStyle(em);
              return (
                <button
                  key={em.id}
                  onMouseEnter={() => setHovered(em)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { onChange(em); onClose(); }}
                  style={{
                    border: isActive ? `2px solid ${em.config.accent}` : "2px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: 0,
                    background: "transparent",
                    textAlign: "left",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                    transition: "all 0.18s",
                    boxShadow: isActive ? `0 0 0 3px ${em.config.accent}30,0 4px 20px rgba(0,0,0,0.4)` : "0 2px 10px rgba(0,0,0,0.3)"
                  }}
                >
                  <div style={{ height: 52, position: "relative", overflow: "hidden", ...wallSt }}>
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${em.config.accent}20, transparent 70%)` }} />
                    <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{em.emoji}</span>
                    {isActive && (
                      <div style={{ position: "absolute", top: 5, right: 6, width: 14, height: 14, borderRadius: "50%", background: em.config.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 8, color: "#000", fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "7px 9px 8px", background: isActive ? `${em.config.accent}18` : "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.05)", transition: "background 0.18s" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? em.config.accent : "#fff", fontFamily: "sans-serif", marginBottom: 2 }}>{em.label}</div>
                    <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", lineHeight: 1.3 }}>{em.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
