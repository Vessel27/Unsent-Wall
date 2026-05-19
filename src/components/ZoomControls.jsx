import { FontAwesomeIcon } from "../lib/faIcons";
import { faMinus, faPlus } from "../lib/faIcons";

export default function ZoomControls({ zoom, onZoomOut, onZoomIn }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={onZoomOut}
        type="button"
        style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer" }}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <span style={{ minWidth: 44, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif" }}>
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        type="button"
        style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer" }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
}
