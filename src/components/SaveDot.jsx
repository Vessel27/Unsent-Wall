export default function SaveDot({ status }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: status === "idle" ? 0 : 1, transition: "opacity 0.4s" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "saved" ? "#4ade80" : "#facc15", transition: "background 0.3s" }} />
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontFamily: "sans-serif" }}>
        {status === "saving" ? "saving..." : "saved"}
      </span>
    </div>
  );
}
