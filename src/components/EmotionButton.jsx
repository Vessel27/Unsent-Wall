import { FontAwesomeIcon } from "../lib/faIcons";
import { faPalette } from "../lib/faIcons";

export default function EmotionButton({ bg, small, onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{
        background: `${bg?.config?.accent || "#fff"}18`,
        border: `1px solid ${bg?.config?.accent || "#fff"}40`,
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: small ? 4 : 6,
        padding: small ? "5px 9px" : "6px 12px",
        color: "rgba(255,255,255,0.75)",
        fontSize: small ? 11 : 12,
        fontFamily: "sans-serif",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.2s"
      }}
    >
      <FontAwesomeIcon icon={faPalette} style={{ fontSize: small ? 13 : 14 }} />
      {!small && <span style={{ color: bg?.config?.accent || "rgba(255,255,255,0.6)" }}>{bg?.label || "mood"}</span>}
    </button>
  );
}
