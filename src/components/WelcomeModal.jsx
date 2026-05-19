import { FontAwesomeIcon, faTimes, faGithub, faFacebook } from "../lib/faIcons";

export default function WelcomeModal({ onClose, col, bg }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}
    >
      <div className="welcome-modal" style={{ width: "min(620px,92vw)", background: "linear-gradient(180deg,#0f1220,#141621)", color: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.06)", border: "none", width: 34, height: 34, borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: 14, color: "#fff" }} />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "Georgia,serif", color: (col?.text) || (bg?.config?.accent) || "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Unsent Wall</h2>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.95)", lineHeight: 1.5, fontFamily: "sans-serif" }}>
          Unsent Wall is an open anonymous messaging wall — it's a wall full of sticky notes from people who want to write on the wall. Notes are public and no account is required to post.
        </p>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: "#fff", fontFamily: "sans-serif" }}>Made by Carl Angelo Dotollo</div>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href={import.meta.env.VITE_GITHUB_URL || "https://github.com/Vessel27"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 13 }}
            >
              <FontAwesomeIcon icon={faGithub} style={{ fontSize: 16 }} />
              <span>GitHub</span>
            </a>
            <a
              href={import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/carlangelo.dotollo"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 13 }}
            >
              <FontAwesomeIcon icon={faFacebook} style={{ fontSize: 16 }} />
              <span>Facebook</span>
            </a>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "#1DB954", color: "#021", fontWeight: 700, cursor: "pointer" }}>got it</button>
        </div>
      </div>
    </div>
  );
}
