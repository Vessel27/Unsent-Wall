import { STICKY_COLORS } from "../lib/wallThemes";
import { formatRelativeTime } from "../lib/timeUtils";
import Spinner from "./Spinner";
import { FontAwesomeIcon, faMusic } from "../lib/faIcons";

const SPOTIFY_ICON = <FontAwesomeIcon icon={faMusic} style={{ fontSize: 10, color: "#fff" }} />;

export default function NoteList({ notes, loading, onNoteClick }) {
  return (
    <div style={{ minHeight: 0, maxHeight: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", padding: "18px 18px 24px", display: "flex", flexDirection: "column", gap: 12, WebkitOverflowScrolling: "touch" }}>
      {loading ? (
        <Spinner />
      ) : notes.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", fontSize: 13 }}>no notes yet — be the first!</div>
      ) : notes.map((n, i) => {
        const color = STICKY_COLORS[n.colorIdx];
        return (
          <div
            key={n.id}
            onClick={() => onNoteClick(n)}
            style={{
              animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.04}s both`,
              background: color.bg,
              borderRadius: 13,
              padding: "18px 18px 16px",
              minHeight: 92,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 3px 14px rgba(0,0,0,0.22),1px 1px 0 rgba(255,255,255,0.5) inset",
              cursor: "pointer",
              userSelect: "none",
              WebkitUserSelect: "none"
            }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(transparent,transparent 23px,${color.lines} 23px,${color.lines} 24px)`, backgroundPosition: "0 32px", opacity: 0.4, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 40, height: 13, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.85, color: color.text, fontFamily: "Georgia,serif", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word", paddingTop: 7, position: "relative" }}>
              {n.text.length > 140 ? `${n.text.slice(0, 137)}…` : n.text}
            </p>
            <div style={{ marginTop: 7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              {n.spotifyUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.09)", borderRadius: 7, padding: "3px 7px", width: "fit-content" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: "#1DB954", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{SPOTIFY_ICON}</div>
                  <span style={{ fontSize: 9.5, color: color.text, opacity: 0.65, fontFamily: "sans-serif" }}>has a song</span>
                </div>
              ) : <div />}
              <span style={{ fontSize: 10, color: color.text, opacity: 0.55, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{formatRelativeTime(n.createdAt)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
