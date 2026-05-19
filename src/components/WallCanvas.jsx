import StickyNote from "./StickyNote";
import Spinner from "./Spinner";

export default function WallCanvas({ wallRef, wallStyle, loading, notes, meta, onDragEnd, onTap, onReactNote, userReactions, zoom, width, height }) {
  return (
    <div ref={wallRef} style={{ position: "relative", width, height, ...wallStyle, touchAction: "pan-x pan-y", transform: `scale(${zoom})`, transformOrigin: "top left", willChange: "transform" }}>
      {loading && <Spinner />}
      {!loading && notes.length === 0 && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.25)", fontFamily: "Georgia,serif", margin: 0 }}>the wall is empty</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "sans-serif", margin: "8px 0 0" }}>be the first to leave a note</p>
        </div>
      )}
      {!loading && notes.map(n => (
        <StickyNote key={n.id} note={n} meta={meta} onDragEnd={onDragEnd} onTap={onTap} onReactNote={onReactNote} userReactions={userReactions} wallRef={wallRef} zoom={zoom} />
      ))}
    </div>
  );
}
