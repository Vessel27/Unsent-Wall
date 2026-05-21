import { STICKY_COLORS } from "../lib/wallThemes";
import { formatRelativeTime } from "../lib/timeUtils";
import Spinner from "./Spinner";
import { FontAwesomeIcon, faMusic } from "../lib/faIcons";
import ShareButton from "./ShareButton";

const SPOTIFY_ICON = <FontAwesomeIcon icon={faMusic} style={{ fontSize: 10, color: "#fff" }} />;

export default function NoteList({ notes, loading, onNoteClick, onReactNote, userReactions = {} }) {
  return (
    <div style={{ minHeight: 0, maxHeight: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", padding: "18px 18px 24px", display: "flex", flexDirection: "column", gap: 12, WebkitOverflowScrolling: "touch" }}>
      {loading ? (
        <Spinner />
      ) : notes.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 60, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif", fontSize: 13 }}>no notes yet — be the first!</div>
      ) : notes.map((n, i) => {
        const color = STICKY_COLORS[n.colorIdx];
        const heartCount = n.reactions?.["❤️"] ?? n.likes ?? 0;
        const hasLiked = userReactions[n.id] === "❤️";

        return (
          <div
            key={n.id}
            onClick={() => onNoteClick(n)}
            style={{
              animation: `fadeUp 0.3s ease ${Math.min(i, 8) * 0.04}s both`,
              background: color.bg,
              borderRadius: 13,
              padding: "18px 18px 16px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 3px 14px rgba(0,0,0,0.22),1px 1px 0 rgba(255,255,255,0.5) inset",
              cursor: "pointer",
              userSelect: "none",
              WebkitUserSelect: "none"
            }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(transparent,transparent 23px,${color.lines} 23px,${color.lines} 24px)`, backgroundPosition: "0 32px", opacity: 0.4, pointerEvents: "none", borderRadius: 13, overflow: "hidden" }} />
            <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 40, height: 13, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.85, color: color.text, fontFamily: "Georgia,serif", whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word", paddingTop: 7, position: "relative", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {n.text}
            </p>

            <div style={{ marginTop: 7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {/* Bottom-left: heart + spotify */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>

                {/* Heart button — always visible */}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactNote?.(n.id);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: hasLiked ? "rgba(255,80,100,0.18)" : "rgba(0,0,0,0.08)",
                    border: "none", borderRadius: 7, padding: "3px 8px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" style={{ transition: "all 0.2s", flexShrink: 0 }}
                    fill={hasLiked || heartCount > 0 ? "#f05070" : "none"}
                    stroke={hasLiked || heartCount > 0 ? "#f05070" : "rgba(0,0,0,0.3)"}
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {heartCount > 0 && (
                    <span style={{
                      fontSize: 10, fontFamily: "sans-serif",
                      color: hasLiked ? "#d03050" : color.text,
                      opacity: hasLiked ? 1 : 0.6,
                      fontWeight: hasLiked ? 600 : 400,
                      transition: "all 0.2s",
                    }}>
                      {heartCount}
                    </span>
                  )}
                </button>

                {/* Spotify badge */}
                {n.spotifyUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.09)", borderRadius: 7, padding: "3px 7px" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: "#1DB954", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{SPOTIFY_ICON}</div>
                    <span style={{ fontSize: 9.5, color: color.text, opacity: 0.65, fontFamily: "sans-serif" }}>has a song</span>
                  </div>
                )}
              </div>

              {/* Bottom-right: share + timestamp */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <ShareButton noteId={n.id} noteText={n.text} shares={n.shares ?? 0} />
                <span style={{ fontSize: 10, color: color.text, opacity: 0.55, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{formatRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}