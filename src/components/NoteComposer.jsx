import SpotifySearch from "./SpotifySearch";
import { STICKY_COLORS } from "../lib/wallThemes";

export default function NoteComposer({ variant, tablet, col, draft, setDraft, onPost, onCancel, onSpotifySelect }) {
  const isMobile = variant === "mobile";
  const outerStyle = isMobile
    ? { position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(5px)" }
    : { position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: tablet ? 18 : 24, backdropFilter: "blur(5px)" };

  const innerStyle = isMobile
    ? { background: col.bg, borderRadius: "20px 20px 0 0", padding: "18px 17px 38px", width: "100%", boxShadow: "0 -6px 36px rgba(0,0,0,0.35)", position: "relative", maxHeight: "92vh", overflowY: "auto" }
    : { background: col.bg, borderRadius: 17, padding: tablet ? "22px 20px 20px" : "26px 24px 22px", width: "100%", maxWidth: tablet ? 390 : 430, boxShadow: "0 24px 60px rgba(0,0,0,0.4)", position: "relative", overflow: "visible" };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onCancel(); }} style={outerStyle}>
      <div style={innerStyle}>
        <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 99 }} />
        <h2 style={{ margin: "10px 0 2px", fontSize: 17, fontWeight: 700, color: col.text, fontFamily: "Georgia,serif" }}>leave a note</h2>
        <p style={{ margin: "0 0 13px", fontSize: 10.5, color: col.text, opacity: 0.5, fontFamily: "sans-serif" }}>anonymous · no account · visible to everyone</p>

        <div style={{ display: "flex", gap: 9, marginBottom: 13 }}>
          {STICKY_COLORS.map((c, i) => (
            <button key={i} onClick={() => setDraft(d => ({ ...d, colorIdx: i }))}
              style={{ width: 32, height: 32, borderRadius: "50%", background: c.bg, border: draft.colorIdx === i ? `3px solid ${c.shadow}` : "2px solid rgba(0,0,0,0.12)", cursor: "pointer", transition: "transform 0.14s", transform: draft.colorIdx === i ? "scale(1.2)" : "scale(1)", flexShrink: 0 }}
            />
          ))}
        </div>

        <textarea
          value={draft.text}
          onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
          placeholder="write what you never said..."
          rows={5}
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1.5px solid ${col.shadow}40`, resize: "none", fontSize: 16, fontFamily: "Georgia,serif", color: col.text, outline: "none", lineHeight: 1.7, padding: "4px 0", boxSizing: "border-box" }}
        />

        <SpotifySearch col={col} onSelect={onSpotifySelect} initialSelected={null} />

        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "13px 0", borderRadius: 11, border: `1.5px solid ${col.shadow}50`, background: "transparent", cursor: "pointer", fontSize: 14, fontFamily: "sans-serif", color: col.text }}>cancel</button>
          <button onClick={onPost} disabled={!draft.text.trim()} style={{ flex: 2, padding: "13px 0", borderRadius: 11, background: col.shadow, border: "none", cursor: draft.text.trim() ? "pointer" : "not-allowed", fontSize: 14, fontFamily: "sans-serif", color: "#fff", fontWeight: 600, opacity: draft.text.trim() ? 1 : 0.42, transition: "opacity 0.2s" }}>post to wall</button>
        </div>
      </div>
    </div>
  );
}
