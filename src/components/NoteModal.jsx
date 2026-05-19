import { useEffect, useState } from "react";
import { STICKY_COLORS, getEmbedUrl } from "../lib/wallThemes";
import { formatRelativeTime } from "../lib/timeUtils";
import { FontAwesomeIcon, faTimes } from "../lib/faIcons";

export default function NoteModal({ modal, onClose, variant, tablet, onAddComment, onReactComment, onReactNote, userReactions }) {
  const isMobile = variant === "mobile";
  const mc = STICKY_COLORS[modal.colorIdx];
  const emb = getEmbedUrl(modal.spotifyUrl);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    setCommentText("");
  }, [modal.id]);

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment?.(modal.id, text);
    setCommentText("");
  };

  const heartCount = modal.reactions?.["❤️"] ?? 0;
  const isLiked = userReactions?.[modal.id] === "❤️";

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : tablet ? 18 : 26,
        backdropFilter: "blur(6px)"
      }}
    >
      <div style={{
        background: mc.bg,
        borderRadius: isMobile ? "20px 20px 0 0" : 17,
        padding: isMobile ? "24px 19px 42px" : tablet ? "26px 20px 20px" : "30px 26px 22px",
        width: "100%",
        maxWidth: isMobile ? "100%" : tablet ? 430 : 470,
        boxShadow: "0 -6px 48px rgba(0,0,0,0.45)",
        position: "relative",
        maxHeight: "88vh",
        overflowY: "auto"
      }}>
        <div style={{ position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)", width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 99 }} />
        <button onClick={onClose} style={{ position: "absolute", top: 13, right: 13, background: "rgba(0,0,0,0.1)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 14, color: mc.text }} />
        </button>

        {/* Note text */}
        <div style={{ backgroundImage: `repeating-linear-gradient(transparent,transparent 27px,${mc.lines} 27px,${mc.lines} 28px)`, backgroundPosition: "0 8px", minHeight: 80, paddingTop: 9, marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.85, color: mc.text, fontFamily: "Georgia,serif", whiteSpace: "pre-wrap" }}>{modal.text}</p>
        </div>

        {/* Heart reaction for the note */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => onReactNote?.(modal.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: isLiked ? "rgba(255,80,100,0.15)" : "rgba(0,0,0,0.08)",
              border: isLiked ? "1.5px solid rgba(255,80,100,0.45)" : `1px solid ${mc.lines}`,
              borderRadius: 999,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: mc.text,
              fontFamily: "sans-serif",
              transition: "all 0.15s"
            }}
          >
            <span style={{ fontSize: 16 }}>❤️</span>
            <span style={{ opacity: isLiked ? 1 : 0.6, fontWeight: isLiked ? 600 : 400 }}>
              {heartCount > 0 ? heartCount : ""}
            </span>
          </button>
        </div>

        {/* Spotify embed */}
        {emb && <iframe src={emb} width="100%" height={isMobile ? 80 : 152} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ borderRadius: 11, display: "block", marginBottom: 16 }} title="Spotify player" />}

        {/* Comments section */}
        <div style={{ paddingTop: 16, borderTop: `1px solid ${mc.lines}`, color: mc.text }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontFamily: "sans-serif", opacity: 0.85 }}>Comments</span>
            <span style={{ fontSize: 11, fontFamily: "sans-serif", opacity: 0.5 }}>{(modal.comments?.length ?? 0)} comments</span>
          </div>

          {(modal.comments?.length ?? 0) > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {modal.comments.map(c => (
                <div key={c.id} style={{ background: "rgba(0,0,0,0.08)", borderRadius: 12, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <p style={{ margin: 0, color: mc.text, fontSize: 12, lineHeight: 1.5, fontFamily: "sans-serif", flex: 1 }}>{c.text}</p>
                    <span style={{ fontSize: 10, opacity: 0.55, fontFamily: "sans-serif", whiteSpace: "nowrap" }}>{formatRelativeTime(c.createdAt)}</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {c.reactions && Object.keys(c.reactions).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {Object.entries(c.reactions).map(([emoji, count]) => (
                          count > 0 ? (
                            <span key={emoji} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", color: mc.text, borderRadius: 999, padding: "4px 8px", fontSize: 11, fontFamily: "sans-serif" }}>
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </span>
                          ) : null
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["❤️", "😂", "🔥", "👍", "😮"].map(emoji => {
                        const reactionKey = `${modal.id}-${c.id}`;
                        const isUserReaction = userReactions?.[reactionKey] === emoji;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onReactComment?.(modal.id, c.id, emoji)}
                            style={{ borderRadius: 999, border: isUserReaction ? `2px solid ${mc.text}` : "1px solid rgba(255,255,255,0.12)", background: isUserReaction ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)", color: mc.text, minWidth: 38, padding: "5px 8px", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif", fontWeight: isUserReaction ? 600 : 400 }}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, opacity: 0.55, fontFamily: "sans-serif" }}>No comments yet. Add the first one.</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmitComment(); }}
              placeholder="Write a comment"
              style={{ flex: 1, borderRadius: 999, border: "1px solid rgba(0,0,0,0.12)", padding: "10px 14px", fontSize: 12, fontFamily: "sans-serif", outline: "none", background: "rgba(255,255,255,0.95)", color: "#111" }}
            />
            <button
              type="button"
              onClick={handleSubmitComment}
              style={{ borderRadius: 999, border: "none", padding: "10px 14px", background: "#222", color: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "sans-serif" }}
            >
              Send
            </button>
          </div>
        </div>

        <p style={{ margin: "18px 0 0", fontSize: 10.5, color: mc.text, opacity: 0.35, fontFamily: "sans-serif", textAlign: "right" }}>anonymous · {formatRelativeTime(modal.createdAt)} · unsent wall</p>
      </div>
    </div>
  );
}
