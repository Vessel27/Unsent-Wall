import { useEffect, useRef, useCallback } from "react";
import { STICKY_COLORS } from "../lib/wallThemes";
import { FontAwesomeIcon, faMusic } from "../lib/faIcons";

function Tape() {
  return (
    <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", width: 50, height: 18, background: "rgba(255,255,255,0.55)", borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.13)", zIndex: 2 }} />
  );
}

function SpotifyChip({ cover, title, col, big }) {
  const sz = big ? 32 : 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.1)", borderRadius: 8, padding: big ? "5px 8px" : "3px 6px", marginTop: 7 }}>
      {cover ? (
        <img src={cover} alt="" style={{ width: sz, height: sz, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{ width: sz, height: sz, borderRadius: 4, background: "#1DB954", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FontAwesomeIcon icon={faMusic} style={{ fontSize: 12, color: "#fff" }} />
        </div>
      )}
      <span style={{ fontSize: big ? 11 : 9.5, color: col.text, opacity: 0.72, fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130, lineHeight: 1.3 }}>
        {title || "Spotify"}
      </span>
    </div>
  );
}

export default function StickyNote({ note, meta, onDragEnd, onTap, onReactNote, userReactions, wallRef, zoom }) {
  const color = STICKY_COLORS[note.colorIdx];
  const spotifyMeta = meta[note.spotifyUrl];
  const posRef = useRef({ x: note.x, y: note.y });
  const velRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const dragRef = useRef(false);
  const rafRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const elRef = useRef(null);
  const noteW = 175;

  useEffect(() => {
    if (!dragRef.current) posRef.current = { x: note.x, y: note.y };
  }, [note.x, note.y]);

  const applyTransform = useCallback((x, y, dragging, settling) => {
    if (!elRef.current) return;
    const rot = (note.id.charCodeAt(1) % 7) - 3;
    const scale = dragging ? 1.08 : settling ? 1.03 : 1;
    const shadow = dragging
      ? "12px 20px 56px rgba(0,0,0,0.65),1px 1px 0 rgba(255,255,255,0.6) inset"
      : "4px 6px 22px rgba(0,0,0,0.38),1px 1px 0 rgba(255,255,255,0.6) inset";

    elRef.current.style.left = `${x}px`;
    elRef.current.style.top = `${y}px`;
    elRef.current.style.transform = `rotate(${rot}deg) scale(${scale})`;
    elRef.current.style.boxShadow = shadow;
    elRef.current.style.zIndex = dragging ? 9999 : note.zIndex;
    elRef.current.style.cursor = dragging ? "grabbing" : "grab";
  }, [note.id, note.zIndex]);

  const momentum = useCallback(() => {
    const decay = 0.88;
    const minVel = 0.3;
    velRef.current.x *= decay;
    velRef.current.y *= decay;

    if (Math.abs(velRef.current.x) < minVel && Math.abs(velRef.current.y) < minVel) {
      velRef.current = { x: 0, y: 0 };
      applyTransform(posRef.current.x, posRef.current.y, false, false);
      onDragEnd(note.id, posRef.current.x, posRef.current.y);
      return;
    }

    posRef.current.x += velRef.current.x;
    posRef.current.y += velRef.current.y;

    if (wallRef.current) {
      posRef.current.x = Math.max(0, Math.min(posRef.current.x, wallRef.current.offsetWidth - noteW));
      posRef.current.y = Math.max(0, Math.min(posRef.current.y, wallRef.current.offsetHeight - 220));
    }

    applyTransform(posRef.current.x, posRef.current.y, false, true);
    rafRef.current = requestAnimationFrame(momentum);
  }, [applyTransform, note.id, onDragEnd, wallRef]);

  const onPointerDown = useCallback((e) => {
    if (["TEXTAREA", "INPUT", "BUTTON", "A"].includes(e.target.tagName)) return;
    e.stopPropagation();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    velRef.current = { x: 0, y: 0 };
    dragRef.current = true;
    movedRef.current = false;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startRef.current = { x: clientX, y: clientY };

    const rect = wallRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const scale = zoom || 1;
    const ox = clientX - rect.left - posRef.current.x * scale;
    const oy = clientY - rect.top - posRef.current.y * scale;
    lastRef.current = { x: clientX, y: clientY, t: Date.now() };
    applyTransform(posRef.current.x, posRef.current.y, true, false);

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      const dx = cx - startRef.current.x;
      const dy = cy - startRef.current.y;
      if (!movedRef.current && Math.hypot(dx, dy) > 4) movedRef.current = true;
      if (!movedRef.current) return;

      const now = Date.now();
      const dt = Math.max(1, now - lastRef.current.t);
      velRef.current = { x: (cx - lastRef.current.x) / dt * 16, y: (cy - lastRef.current.y) / dt * 16 };
      lastRef.current = { x: cx, y: cy, t: now };

      const wallRect = wallRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const sc = zoom || 1;
      let nx = (cx - wallRect.left - ox) / sc;
      let ny = (cy - wallRect.top - oy) / sc;

      if (wallRef.current) {
        nx = Math.max(0, Math.min(nx, wallRef.current.offsetWidth - noteW));
        ny = Math.max(0, Math.min(ny, wallRef.current.offsetHeight - 220));
      }

      posRef.current = { x: nx, y: ny };
      applyTransform(nx, ny, true, false);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      dragRef.current = false;
      if (!movedRef.current) {
        applyTransform(posRef.current.x, posRef.current.y, false, false);
        onTap(note);
        return;
      }
      rafRef.current = requestAnimationFrame(momentum);
    };

    if (e.type === "touchstart") {
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onUp);
    } else {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
  }, [applyTransform, momentum, note, onDragEnd, onTap, wallRef, zoom]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const rot = (note.id.charCodeAt(1) % 7) - 3;
  const heartCount = note.reactions?.["❤️"] ?? 0;
  const isLiked = userReactions?.[note.id] === "❤️";

  return (
    <div
      ref={elRef}
      className="sticky-note"
      onPointerDown={onPointerDown}
      onTouchStart={onPointerDown}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: noteW,
        zIndex: note.zIndex,
        background: color.bg,
        borderRadius: "2px 11px 11px 2px",
        overflow: "hidden",
        boxShadow: "4px 6px 22px rgba(0,0,0,0.38),1px 1px 0 rgba(255,255,255,0.6) inset",
        cursor: "grab",
        transform: `rotate(${rot}deg) scale(1)`,
        willChange: "transform, left, top, box-shadow",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        WebkitTouchCallout: "none"
      }}
    >
      <Tape />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(transparent,transparent 23px,${color.lines} 23px,${color.lines} 24px)`, backgroundPosition: "0 32px", opacity: 0.45, pointerEvents: "none" }} />
      <div style={{ padding: "21px 12px 11px", position: "relative" }}>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: color.text, fontFamily: "Georgia,serif", wordBreak: "break-word", minHeight: 52 }}>
          {note.text.length > 120 ? `${note.text.slice(0, 117)}...` : note.text}
        </p>
        {note.spotifyUrl && <SpotifyChip cover={spotifyMeta?.cover} title={spotifyMeta?.title} col={color} />}
      </div>
      <div style={{ padding: "0 12px 10px", display: "flex", justifyContent: "flex-end", position: "relative" }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onReactNote?.(note.id); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: isLiked ? "rgba(255,80,100,0.18)" : "rgba(0,0,0,0.08)",
            border: isLiked ? "1.5px solid rgba(255,80,100,0.5)" : "1px solid rgba(0,0,0,0.1)",
            borderRadius: 999,
            padding: "3px 8px",
            cursor: "pointer",
            fontSize: 11,
            color: color.text,
            fontFamily: "sans-serif",
            transition: "all 0.15s",
            lineHeight: 1
          }}
        >
          <span style={{ fontSize: 12, filter: isLiked ? "none" : "grayscale(0.3)" }}>❤️</span>
          {heartCount > 0 && <span style={{ opacity: 0.75 }}>{heartCount}</span>}
        </button>
      </div>
    </div>
  );
}
