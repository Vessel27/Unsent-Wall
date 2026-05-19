export default function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: 14 }}>
      <div style={{ width: 32, height: 32, border: "2.5px solid rgba(255,255,255,0.12)", borderTop: "2.5px solid rgba(255,255,255,0.65)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)", fontFamily: "sans-serif", letterSpacing: "1px" }}>loading the wall...</p>
    </div>
  );
}
