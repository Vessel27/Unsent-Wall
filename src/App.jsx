import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

// ── Firebase storage functions ───────────────────────────────────────────────

async function loadNotes() {
  try {
    const q = query(
      collection(db, "wallNotes"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const payload = d.data();
      return {
        id: d.id,
        text: payload.text ?? "",
        spotifyUrl: payload.spotifyUrl ?? "",
        colorIdx: payload.colorIdx ?? 0,
        x: payload.x ?? 20,
        y: payload.y ?? 20,
        zIndex: payload.zIndex ?? 1,
        createdAt: payload.createdAt ?? 0,
        ...payload
      };
    });

  } catch (e) {
    console.error("loadNotes:", e);
    return [];
  }
}

async function saveNote(note) {
  try {
    const ref = await addDoc(
      collection(db, "wallNotes"),
      note
    );

    return ref.id;

  } catch (e) {
    console.error("saveNote:", e);
    return null;
  }
}

async function updateNotePosition(id, x, y, zIndex) {
  try {
    await updateDoc(
      doc(db, "wallNotes", id),
      {
        x,
        y,
        zIndex
      }
    );
  } catch (e) {
    console.error("updateNotePosition:", e);
  }
}


// ─────────────────────────────────────────────
// BACKGROUND
// ─────────────────────────────────────────────

async function loadBg() {
  try {
    const snap = await getDoc(
      doc(db, "wall", "bg")
    );

    if (snap.exists()) {
      return snap.data().value ?? null;
    }

  } catch (e) {
    console.error("loadBg:", e);
  }

  return null;
}


async function saveBg(bg) {
  try {
    await setDoc(
      doc(db, "wall", "bg"),
      {
        value: bg
      }
    );
  } catch (e) {
    console.error("saveBg:", e);
  }
}

// ── Spotify token cache ──────────────────────────────────────────────────────
// Credentials from your Spotify Developer Dashboard.
// The token fetch goes through:
//   • Local dev  → Vite proxy at /spotify-token  (see vite.config.js)
//   • Production → Firebase Function at /api/spotify-token  (see functions/index.js)
// Both avoid the CORS block that happens when calling accounts.spotify.com directly.
// ── Constants ────────────────────────────────────────────────────────────────

const STICKY_COLORS = [
  { name:"lemon", bg:"#FFF176", shadow:"#F9A825", text:"#3E2723", lines:"#F9A82555" },
  { name:"rose",  bg:"#FFCDD2", shadow:"#E53935", text:"#3E0012", lines:"#E5393540" },
  { name:"mint",  bg:"#C8E6C9", shadow:"#388E3C", text:"#0a2e0c", lines:"#388E3C40" },
  { name:"sky",   bg:"#B3E5FC", shadow:"#0288D1", text:"#01233a", lines:"#0288D140" },
  { name:"lilac", bg:"#E1BEE7", shadow:"#8E24AA", text:"#1a0026", lines:"#8E24AA40" },
  { name:"peach", bg:"#FFE0B2", shadow:"#EF6C00", text:"#3e1400", lines:"#EF6C0040" },
];

const EMOTION_BACKGROUNDS = [
  { id:"grief",       emotion:"grief",       label:"Grief",       emoji:"🌧", desc:"heavy, quiet, blue",      config:{ stops:["#0a0e1a","#101828","#0d1520"], angle:170, pattern:"rain",     patternColor:"#4a90d9", accent:"#4a90d9" } },
  { id:"longing",     emotion:"longing",     label:"Longing",     emoji:"🌙", desc:"soft, aching, dusk",      config:{ stops:["#120820","#1e0e30","#0e1428"], angle:145, pattern:"stars",    patternColor:"#c4a4f0", accent:"#c4a4f0" } },
  { id:"anger",       emotion:"anger",       label:"Anger",       emoji:"🔥", desc:"raw, burning, red",       config:{ stops:["#1a0505","#2d0a00","#180800"], angle:120, pattern:"sparks",   patternColor:"#ff4422", accent:"#ff4422" } },
  { id:"hope",        emotion:"hope",        label:"Hope",        emoji:"🌅", desc:"warm, golden, rising",    config:{ stops:["#1a1005","#2a1a08","#1a1510"], angle:160, pattern:"rays",     patternColor:"#f0c060", accent:"#f0c060" } },
  { id:"guilt",       emotion:"guilt",       label:"Guilt",       emoji:"🪨", desc:"heavy, grey, sunken",     config:{ stops:["#0f0f10","#171718","#111213"], angle:180, pattern:"cracks",   patternColor:"#606068", accent:"#606068" } },
  { id:"love",        emotion:"love",        label:"Love",        emoji:"🌸", desc:"tender, rose, soft",      config:{ stops:["#1a0810","#280d18","#1a0a14"], angle:135, pattern:"petals",   patternColor:"#e880a0", accent:"#e880a0" } },
  { id:"peace",       emotion:"peace",       label:"Peace",       emoji:"🌿", desc:"still, green, breathing", config:{ stops:["#060f09","#0c1a0e","#080d0a"], angle:150, pattern:"leaves",   patternColor:"#4caf70", accent:"#4caf70" } },
  { id:"nostalgia",   emotion:"nostalgia",   label:"Nostalgia",   emoji:"📼", desc:"faded, amber, worn",      config:{ stops:["#1a1408","#221a0a","#18140a"], angle:135, pattern:"grain",    patternColor:"#c89040", accent:"#c89040" } },
  { id:"anxiety",     emotion:"anxiety",     label:"Anxiety",     emoji:"⚡", desc:"tense, electric, racing", config:{ stops:["#080a18","#0e1020","#06080f"], angle:110, pattern:"zigzag",   patternColor:"#8080ff", accent:"#8080ff" } },
  { id:"joy",         emotion:"joy",         label:"Joy",         emoji:"✨", desc:"bright, sparkling, free", config:{ stops:["#10100a","#1a1a08","#151208"], angle:135, pattern:"sparkles", patternColor:"#ffe060", accent:"#ffe060" } },
  { id:"emptiness",   emotion:"emptiness",   label:"Emptiness",   emoji:"🌫", desc:"hollow, muted, vast",     config:{ stops:["#0c0c0d","#0f0f10","#0a0a0b"], angle:180, pattern:"void",     patternColor:"#404045", accent:"#404045" } },
  { id:"forgiveness", emotion:"forgiveness", label:"Forgiveness", emoji:"🕊", desc:"light, white, open",      config:{ stops:["#0d0f14","#131620","#0f1018"], angle:155, pattern:"feathers", patternColor:"#c0d0f0", accent:"#c0d0f0" } },
];

function buildPatternSvg(pattern, color) {
  const c = encodeURIComponent(color);
  switch (pattern) {
    case "rain":     return `url("data:image/svg+xml,%3Csvg width='20' height='40' viewBox='0 0 20 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='10' y1='0' x2='8' y2='20' stroke='${c}' stroke-opacity='0.15' stroke-width='1' stroke-linecap='round'/%3E%3Cline x1='3' y1='10' x2='1' y2='30' stroke='${c}' stroke-opacity='0.08' stroke-width='0.7' stroke-linecap='round'/%3E%3Cline x1='17' y1='5' x2='15' y2='25' stroke='${c}' stroke-opacity='0.1' stroke-width='0.8' stroke-linecap='round'/%3E%3C/svg%3E")`;
    case "stars":    return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='${c}' fill-opacity='0.5'/%3E%3Ccircle cx='10' cy='10' r='0.6' fill='${c}' fill-opacity='0.3'/%3E%3Ccircle cx='50' cy='15' r='0.8' fill='${c}' fill-opacity='0.4'/%3E%3Ccircle cx='5' cy='45' r='0.5' fill='${c}' fill-opacity='0.25'/%3E%3Ccircle cx='55' cy='50' r='0.7' fill='${c}' fill-opacity='0.35'/%3E%3C/svg%3E")`;
    case "sparks":   return `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5 L27 23 L25 25 L23 23Z' fill='${c}' fill-opacity='0.1'/%3E%3Cpath d='M45 25 L27 27 L25 25 L27 23Z' fill='${c}' fill-opacity='0.08'/%3E%3C/svg%3E")`;
    case "rays":     return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='40' y1='40' x2='80' y2='0' stroke='${c}' stroke-opacity='0.06' stroke-width='1'/%3E%3Cline x1='40' y1='40' x2='80' y2='80' stroke='${c}' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E")`;
    case "cracks":   return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L32 18 L28 30 L35 45 L30 60' stroke='${c}' stroke-opacity='0.12' stroke-width='0.8' fill='none'/%3E%3C/svg%3E")`;
    case "petals":   return `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='25' cy='18' rx='5' ry='10' fill='${c}' fill-opacity='0.07' transform='rotate(0 25 25)'/%3E%3Cellipse cx='25' cy='18' rx='5' ry='10' fill='${c}' fill-opacity='0.05' transform='rotate(120 25 25)'/%3E%3C/svg%3E")`;
    case "leaves":   return `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 50 Q30 10 50 30 Q30 50 10 50Z' fill='${c}' fill-opacity='0.07'/%3E%3C/svg%3E")`;
    case "grain":    return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='0.06' fill='${c}'/%3E%3C/svg%3E")`;
    case "zigzag":   return `url("data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='0,10 10,0 20,10 30,0 40,10' fill='none' stroke='${c}' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`;
    case "sparkles": return `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 20 L26 24 L30 25 L26 26 L25 30 L24 26 L20 25 L24 24Z' fill='${c}' fill-opacity='0.2'/%3E%3C/svg%3E")`;
    case "void":     return `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='${c}' stroke-opacity='0.04' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='${c}' stroke-opacity='0.03' stroke-width='0.5'/%3E%3C/svg%3E")`;
    case "feathers": return `url("data:image/svg+xml,%3Csvg width='40' height='60' viewBox='0 0 40 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 Q35 15 20 30 Q5 15 20 0Z' fill='${c}' fill-opacity='0.07'/%3E%3C/svg%3E")`;
    default:         return "none";
  }
}

function buildWallStyle(bg) {
  if (!bg) return {};
  const { stops, angle, pattern, patternColor } = bg.config;
  const grad = `linear-gradient(${angle}deg,${stops.join(",")})`;
  const pat  = buildPatternSvg(pattern, patternColor || "#ffffff");
  return { background: grad, backgroundImage: pat !== "none" ? `${pat},${grad}` : grad };
}

function buildBodyCss(bg) {
  if (!bg) return "";
  const { stops, angle, pattern, patternColor } = bg.config;
  const grad  = `linear-gradient(${angle}deg,${stops.join(",")})`;
  const pat   = buildPatternSvg(pattern, patternColor || "#ffffff");
  const bgImg = pat !== "none" ? `${pat},${grad}` : grad;
  return `background:${stops[0]};background-image:${bgImg};`;
}

const GLOBAL_CSS = `
*{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
html,body,#root{margin:0;padding:0;width:100%;min-height:100vh;overflow:hidden;}
#root{border:none;}
input,textarea{font-size:16px!important;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

function GlobalStyles({ bodyCss }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`body{${bodyCss}}`}</style>
    </>
  );
}

function SaveDot({ status }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:4,opacity:status==="idle"?0:1,transition:"opacity 0.4s" }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:status==="saved"?"#4ade80":"#facc15",transition:"background 0.3s" }} />
      <span style={{ fontSize:10,color:"rgba(255,255,255,0.45)",fontFamily:"sans-serif" }}>
        {status === "saving" ? "saving..." : "saved"}
      </span>
    </div>
  );
}

function EmotionButton({ bg, small, onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={{ background:`${bg?.config?.accent||"#fff"}18`,border:`1px solid ${bg?.config?.accent||"#fff"}40`,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:small?4:6,padding:small?"5px 9px":"6px 12px",color:"rgba(255,255,255,0.75)",fontSize:small?11:12,fontFamily:"sans-serif",WebkitTapHighlightColor:"transparent",transition:"all 0.2s" }}
    >
      <span style={{ fontSize:small?13:14 }}>{bg?.emoji || "🎨"}</span>
      {!small && <span style={{ color:bg?.config?.accent||"rgba(255,255,255,0.6)" }}>{bg?.label || "mood"}</span>}
    </button>
  );
}

function ZoomControls({ zoom, onZoomOut, onZoomIn }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
      <button onClick={onZoomOut} style={{ width:32,height:32,borderRadius:10,border:"1px solid rgba(255,255,255,0.24)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:18,cursor:"pointer" }} type="button">−</button>
      <span style={{ minWidth:44,textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.85)",fontFamily:"sans-serif" }}>{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} style={{ width:32,height:32,borderRadius:10,border:"1px solid rgba(255,255,255,0.24)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:18,cursor:"pointer" }} type="button">+</button>
    </div>
  );
}

function getEmbedUrl(url) {
  const m = url?.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

function normalizeSpotifyUrl(value) {
  if (!value) return null;
  const trimmed = value.trim();
  const openMatch = trimmed.match(/^(https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+))(\?.*)?$/i);
  if (openMatch) return openMatch[1];
  const uriMatch = trimmed.match(/^spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)$/i);
  if (uriMatch) return `https://open.spotify.com/${uriMatch[1]}/${uriMatch[2]}`;
  return null;
}

const SPOTIFY_ICON = <span style={{ fontSize:10 }}>🎵</span>;

let gZ = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────

function useBreakpoint() {
  const get = () => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 480)  return "mobile";
    if (window.innerWidth < 768)  return "mobileLg";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const fn = () => setBp(get());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Tape() {
  return (
    <div style={{ position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",width:50,height:18,background:"rgba(255,255,255,0.55)",borderRadius:2,boxShadow:"0 1px 3px rgba(0,0,0,0.13)",zIndex:2 }} />
  );
}

function SpotifyChip({ cover, title, col, big }) {
  const sz = big ? 32 : 24;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.1)",borderRadius:8,padding:big?"5px 8px":"3px 6px",marginTop:7 }}>
      {cover
        ? <img src={cover} alt="" style={{ width:sz,height:sz,borderRadius:4,objectFit:"cover",flexShrink:0 }} />
        : <div style={{ width:sz,height:sz,borderRadius:4,background:"#1DB954",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{SPOTIFY_ICON}</div>
      }
      <span style={{ fontSize:big?11:9.5,color:col.text,opacity:0.72,fontFamily:"sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:130,lineHeight:1.3 }}>
        {title || "Spotify"}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"300px",gap:14 }}>
      <div style={{ width:32,height:32,border:"2.5px solid rgba(255,255,255,0.12)",borderTop:"2.5px solid rgba(255,255,255,0.65)",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <p style={{ margin:0,fontSize:12,color:"rgba(255,255,255,0.38)",fontFamily:"sans-serif",letterSpacing:"1px" }}>loading the wall...</p>
    </div>
  );
}

// ── Spotify input component ─────────────────────────────────────────────────

function SpotifySearch({ col, onSelect, initialSelected }) {
  const [input, setInput] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(initialSelected || "");
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateLink = useCallback(async (value) => {
    const url = normalizeSpotifyUrl(value);
    if (!url) {
      setSelectedUrl("");
      setSelectedMeta(null);
      setErrorMsg(value.trim() ? "Paste a Spotify track, album, playlist, or episode URL." : "");
      onSelect("", null);
      return false;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("invalid spotify link");
      const data = await response.json();
      const meta = { title: data.title, cover: data.thumbnail_url };
      setSelectedUrl(url);
      setSelectedMeta(meta);
      setInput(url);
      onSelect(url, meta);
      return true;
    } catch {
      setSelectedUrl("");
      setSelectedMeta(null);
      setErrorMsg("Unable to verify the Spotify link. Paste the full open.spotify.com URL.");
      onSelect("", null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await validateLink(input);
  };

  const handleClear = () => {
    setInput("");
    setSelectedUrl("");
    setSelectedMeta(null);
    setErrorMsg("");
    onSelect("", null);
  };

  return (
    <div style={{ marginTop:12 }}>
      <label style={{ fontSize:11.5,fontFamily:"sans-serif",color:col.text,opacity:0.55,display:"block",marginBottom:5 }}>
        🎵 Add a song (optional)
      </label>

      {selectedUrl ? (
        <div style={{ display:"flex",alignItems:"center",gap:10,background:"rgba(0,0,0,0.09)",borderRadius:10,padding:"10px 12px" }}>
          {selectedMeta?.cover ? (
            <img src={selectedMeta.cover} alt="" style={{ width:36,height:36,borderRadius:6,objectFit:"cover",flexShrink:0 }} />
          ) : (
            <div style={{ width:36,height:36,borderRadius:6,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ fontSize:18,color:col.text }}>🎵</span>
            </div>
          )}
          <div style={{ flex:1,overflow:"hidden" }}>
            <div style={{ fontSize:12.5,color:col.text,fontFamily:"sans-serif",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
              {selectedMeta?.title || "Spotify link added"}
            </div>
            <div style={{ fontSize:10.5,color:col.text,opacity:0.6,fontFamily:"sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
              {selectedUrl}
            </div>
          </div>
          <button
            onClick={handleClear}
            type="button"
            style={{ background:"rgba(0,0,0,0.12)",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:14,color:col.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1 }}
          >×</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ position:"relative" }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Paste Spotify link here..."
            style={{ width:"100%",background:"rgba(0,0,0,0.09)",border:"none",borderRadius:8,padding:"10px 100px 10px 12px",fontSize:16,fontFamily:"sans-serif",color:col.text,outline:"none",boxSizing:"border-box" }}
          />
          <button
            type="submit"
            style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",padding:"8px 12px",borderRadius:8,border:"none",background:col.shadow,color:"#fff",fontSize:12,cursor:input.trim() ? "pointer" : "not-allowed",opacity:input.trim() ? 1 : 0.5 }}
            disabled={!input.trim()}
          >
            {loading ? "checking…" : "add"}
          </button>
        </form>
      )}

      {errorMsg && (
        <p style={{ margin:"8px 0 0",fontSize:10.5,color:col.text,opacity:0.6,fontFamily:"sans-serif" }}>{errorMsg}</p>
      )}
      {!errorMsg && !selectedUrl && (
        <p style={{ margin:"8px 0 0",fontSize:10.5,color:col.text,opacity:0.45,fontFamily:"sans-serif" }}>Supported Spotify URLs: track, album, playlist, episode.</p>
      )}
    </div>
  );
}

// ── Emotion picker ────────────────────────────────────────────────────────────

function EmotionBgPicker({ current, onChange, onClose }) {
  const [hovered, setHovered] = useState(null);
  const preview      = hovered || current;
  const previewStyle = preview ? buildWallStyle(preview) : {};

  return (
    <div
      style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:"rgba(10,8,20,0.97)",borderRadius:24,border:"1px solid rgba(255,255,255,0.08)",width:"min(620px,96vw)",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 32px 100px rgba(0,0,0,0.8)" }}>
        <div style={{ padding:"20px 20px 0",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6 }}>
            <div>
              <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:"#fff",fontFamily:"Georgia,serif" }}>how are you feeling?</h3>
              <p style={{ margin:"4px 0 0",fontSize:11,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif" }}>the wall will reflect your emotion</p>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
          <div style={{ marginTop:14,borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",height:80,position:"relative",transition:"all 0.4s ease",...previewStyle }}>
            {[{l:"6%",t:"15%",r:-2,c:0},{l:"28%",t:"8%",r:1.5,c:2},{l:"50%",t:"18%",r:-1,c:4},{l:"70%",t:"5%",r:2,c:1},{l:"86%",t:"14%",r:-1.5,c:5}].map((p,i) => (
              <div key={i} style={{ position:"absolute",left:p.l,top:p.t,width:32,height:26,background:STICKY_COLORS[p.c].bg,borderRadius:"1px 5px 5px 1px",transform:`rotate(${p.r}deg)`,boxShadow:"1px 2px 6px rgba(0,0,0,0.4)",opacity:0.92 }}>
                <div style={{ position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",width:14,height:7,background:"rgba(255,255,255,0.6)",borderRadius:2 }} />
              </div>
            ))}
            {preview && (
              <div style={{ position:"absolute",bottom:8,right:10,display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ fontSize:16 }}>{preview.emoji}</span>
                <span style={{ fontSize:11,color:"rgba(255,255,255,0.6)",fontFamily:"sans-serif",fontStyle:"italic" }}>{preview.desc}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ overflowY:"auto",padding:"14px 20px 20px",WebkitOverflowScrolling:"touch" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9 }}>
            {EMOTION_BACKGROUNDS.map(em => {
              const isActive = current?.id === em.id;
              const wallSt   = buildWallStyle(em);
              return (
                <button
                  key={em.id}
                  onMouseEnter={() => setHovered(em)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { onChange(em); onClose(); }}
                  style={{ border:isActive?`2px solid ${em.config.accent}`:"2px solid rgba(255,255,255,0.07)",borderRadius:14,overflow:"hidden",cursor:"pointer",padding:0,background:"transparent",textAlign:"left",transform:isActive?"scale(1.03)":"scale(1)",transition:"all 0.18s",boxShadow:isActive?`0 0 0 3px ${em.config.accent}30,0 4px 20px rgba(0,0,0,0.4)`:"0 2px 10px rgba(0,0,0,0.3)" }}
                >
                  <div style={{ height:52,position:"relative",overflow:"hidden",...wallSt }}>
                    <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 100%,${em.config.accent}20,transparent 70%)` }} />
                    <span style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:22,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{em.emoji}</span>
                    {isActive && (
                      <div style={{ position:"absolute",top:5,right:6,width:14,height:14,borderRadius:"50%",background:em.config.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ fontSize:8,color:"#000",fontWeight:700 }}>✓</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding:"7px 9px 8px",background:isActive?`${em.config.accent}18`:"rgba(255,255,255,0.03)",borderTop:"1px solid rgba(255,255,255,0.05)",transition:"background 0.18s" }}>
                    <div style={{ fontSize:12,fontWeight:600,color:isActive?em.config.accent:"#fff",fontFamily:"sans-serif",marginBottom:2 }}>{em.label}</div>
                    <div style={{ fontSize:9.5,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif",lineHeight:1.3 }}>{em.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Draggable sticky note ─────────────────────────────────────────────────────

function StickyNote({ note, meta, onDragEnd, onTap, wallRef, zoom }) {
  const c        = STICKY_COLORS[note.colorIdx];
  const m        = meta[note.spotifyUrl];
  const posRef   = useRef({ x: note.x, y: note.y });
  const velRef   = useRef({ x: 0, y: 0 });
  const lastRef  = useRef({ x: 0, y: 0, t: 0 });
  const dragRef  = useRef(false);
  const rafRef   = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const elRef    = useRef(null);
  const noteW    = 175;

  useEffect(() => {
    if (!dragRef.current) posRef.current = { x: note.x, y: note.y };
  }, [note.x, note.y]);

  const applyTransform = useCallback((x, y, dragging, settling) => {
    if (!elRef.current) return;
    const rot    = (note.id.charCodeAt(1) % 7) - 3;
    const scale  = dragging ? 1.08 : settling ? 1.03 : 1;
    const shadow = dragging
      ? "12px 20px 56px rgba(0,0,0,0.65),1px 1px 0 rgba(255,255,255,0.6) inset"
      : "4px 6px 22px rgba(0,0,0,0.38),1px 1px 0 rgba(255,255,255,0.6) inset";
    elRef.current.style.left      = `${x}px`;
    elRef.current.style.top       = `${y}px`;
    elRef.current.style.transform = `rotate(${rot}deg) scale(${scale})`;
    elRef.current.style.boxShadow = shadow;
    elRef.current.style.zIndex    = dragging ? 9999 : note.zIndex;
    elRef.current.style.cursor    = dragging ? "grabbing" : "grab";
  }, [note.id, note.zIndex]);

  const momentum = useCallback(() => {
    const decay  = 0.88;
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
      posRef.current.x = Math.max(0, Math.min(posRef.current.x, wallRef.current.offsetWidth  - noteW));
      posRef.current.y = Math.max(0, Math.min(posRef.current.y, wallRef.current.offsetHeight - 220));
    }
    applyTransform(posRef.current.x, posRef.current.y, false, true);
    rafRef.current = requestAnimationFrame(momentum);
  }, [applyTransform, note.id, onDragEnd, wallRef]);

  const onPointerDown = useCallback((e) => {
    if (["TEXTAREA","INPUT","BUTTON","A"].includes(e.target.tagName)) return;
    e.stopPropagation();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    velRef.current   = { x: 0, y: 0 };
    dragRef.current  = true;
    movedRef.current = false;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startRef.current = { x: clientX, y: clientY };

    const rect  = wallRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const scale = zoom || 1;
    const ox    = clientX - rect.left - posRef.current.x * scale;
    const oy    = clientY - rect.top  - posRef.current.y * scale;
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
      const now      = Date.now();
      const dt       = Math.max(1, now - lastRef.current.t);
      velRef.current = { x: (cx - lastRef.current.x) / dt * 16, y: (cy - lastRef.current.y) / dt * 16 };
      lastRef.current = { x: cx, y: cy, t: now };
      const wallRect  = wallRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const sc        = zoom || 1;
      let nx = (cx - wallRect.left - ox) / sc;
      let ny = (cy - wallRect.top  - oy) / sc;
      if (wallRef.current) {
        nx = Math.max(0, Math.min(nx, wallRef.current.offsetWidth  - noteW));
        ny = Math.max(0, Math.min(ny, wallRef.current.offsetHeight - 220));
      }
      posRef.current = { x: nx, y: ny };
      applyTransform(nx, ny, true, false);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
      window.removeEventListener("touchmove",   onMove);
      window.removeEventListener("touchend",    onUp);
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
      window.addEventListener("touchend",  onUp);
    } else {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
    }
  }, [applyTransform, momentum, note, onDragEnd, onTap, wallRef, zoom]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const rot = (note.id.charCodeAt(1) % 7) - 3;

  return (
    <div
      ref={elRef}
      className="sticky-note"
      onPointerDown={onPointerDown}
      onTouchStart={onPointerDown}
      style={{
        position:"absolute",left:note.x,top:note.y,width:noteW,zIndex:note.zIndex,
        background:c.bg,borderRadius:"2px 11px 11px 2px",overflow:"hidden",
        boxShadow:"4px 6px 22px rgba(0,0,0,0.38),1px 1px 0 rgba(255,255,255,0.6) inset",
        cursor:"grab",transform:`rotate(${rot}deg) scale(1)`,
        willChange:"transform, left, top, box-shadow",
        userSelect:"none",WebkitUserSelect:"none",
        touchAction:"none",WebkitTouchCallout:"none",
      }}
    >
      <Tape />
      <div style={{ position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(transparent,transparent 23px,${c.lines} 23px,${c.lines} 24px)`,backgroundPosition:"0 32px",opacity:0.45,pointerEvents:"none" }} />
      <div style={{ padding:"21px 12px 11px",position:"relative" }}>
        <p style={{ margin:0,fontSize:11.5,lineHeight:1.65,color:c.text,fontFamily:"Georgia,serif",wordBreak:"break-word",minHeight:52 }}>
          {note.text.length > 120 ? note.text.slice(0,117) + "..." : note.text}
        </p>
        {note.spotifyUrl && <SpotifyChip cover={m?.cover} title={m?.title} col={c} />}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UnsentWall() {
  const bp     = useBreakpoint();
  const mobile = bp === "mobile" || bp === "mobileLg";
  const tablet = bp === "tablet";

  const WALL_W = 3200;
  const WALL_H = 1800;

  const [notes,      setNotes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [bg,         setBg]         = useState(EMOTION_BACKGROUNDS[1]); // longing default
  const [showBgPick, setShowBgPick] = useState(false);
  const [modal,      setModal]      = useState(null);
  const [composing,  setComposing]  = useState(false);
  const [draft,      setDraft]      = useState({ text:"", url:"", colorIdx:0 });
  const [meta,       setMeta]       = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [mobileTab,  setMobileTab]  = useState("wall");
  const [desktopTab, setDesktopTab] = useState("wall");
  const [showWelcome, setShowWelcome] = useState(false);
  const [zoom,       setZoom]       = useState(1);
  const welcomeSeenKey = "unsentWallWelcomeSeen";

  const wallRef   = useRef(null);
  const textRef   = useRef(null);

  // ── Load from Firestore on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [stored, storedBg] = await Promise.all([loadNotes(), loadBg()]);
      if (stored) {
        const maxZ = Math.max(...stored.map(n => n.zIndex ?? 1), 20);
        gZ = maxZ + 1;
        setNotes(stored);
      } else {
        setNotes([]);
      }
      if (storedBg?.id) {
        const matched = EMOTION_BACKGROUNDS.find(e => e.id === storedBg.id);
        if (matched) setBg(matched);
      }
      setLoading(false);
    })();

    try {
      const seen = window.localStorage.getItem(welcomeSeenKey);
      if (!seen) {
        setShowWelcome(true);
        window.localStorage.setItem(welcomeSeenKey, "1");
      }
    } catch {}
  }, []);

  // ── Spotify oEmbed metadata (for notes loaded from DB that only have a URL) ─
  const fetchMeta = useCallback(async (url) => {
    if (!url || meta[url]) return;
    try {
      const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!r.ok) return;
      const d = await r.json();
      setMeta(p => ({ ...p, [url]: { title: d.title, cover: d.thumbnail_url } }));
    } catch {}
  }, [meta]);

  useEffect(() => { notes.forEach(n => n.spotifyUrl && fetchMeta(n.spotifyUrl)); }, [notes, fetchMeta]);

  const handleDragEnd = useCallback(async (id, x, y) => {

    gZ++;

    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              x,
              y,
              zIndex: gZ
            }
          : n
      )
    );

    await updateNotePosition(id, x, y, gZ);

  }, []);

  const handleTap = useCallback((note) => { setModal(note); }, []);

  const changeBg = useCallback((newBg) => { setBg(newBg); saveBg(newBg); }, []);

  // ── Called by SpotifySearch when user picks a track ───────────────────────
  const handleSpotifySelect = useCallback((url, trackMeta) => {
    setDraft(d => ({ ...d, url }));
    if (url && trackMeta) {
      setMeta(p => ({ ...p, [url]: trackMeta }));
    }
  }, []);

  const post = async () => {

    if (!draft.text.trim()) return;

    gZ++;

    const newNote = {
      text: draft.text,
      spotifyUrl: draft.url,
      colorIdx: draft.colorIdx,

      x: 20 + Math.random() * (WALL_W - 220),
      y: 20 + Math.random() * (WALL_H - 320),

      zIndex: gZ,
      createdAt: Date.now()
    };

    // optimistic UI
    const tempId = `temp-${Date.now()}`;

    setNotes(prev => [
      {
        ...newNote,
        id: tempId
      },
      ...prev
    ]);

    setSaveStatus("saving");

    const realId = await saveNote(newNote);

    if (realId) {

      setNotes(prev =>
        prev.map(n =>
          n.id === tempId
            ? { ...n, id: realId }
            : n
        )
      );

      setSaveStatus("saved");

    } else {

      // rollback if failed
      setNotes(prev =>
        prev.filter(n => n.id !== tempId)
      );

      setSaveStatus("idle");
    }

    setTimeout(() => {
      setSaveStatus("idle");
    }, 1500);

    setDraft({
      text: "",
      url: "",
      colorIdx: 0
    });

    setComposing(false);
  };

  const clampZoom = (value) => Math.min(1.4, Math.max(0.72, value));
  const zoomStep  = 0.14;

  const col      = STICKY_COLORS[draft.colorIdx];
  const wallStyle = buildWallStyle(bg);
  const bodyCss   = buildBodyCss(bg);

  // ── Wall canvas (shared between mobile/desktop) ───────────────────────────
  const WallCanvas = () => (
    <div
      ref={wallRef}
      style={{ position:"relative",width:WALL_W,height:WALL_H,...wallStyle,touchAction:"pan-x pan-y",transform:`scale(${zoom})`,transformOrigin:"top left",willChange:"transform" }}
    >
      {loading && <Spinner />}
      {!loading && notes.length === 0 && (
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none" }}>
          <p style={{ fontSize:18,color:"rgba(255,255,255,0.25)",fontFamily:"Georgia,serif",margin:0 }}>the wall is empty</p>
          <p style={{ fontSize:12,color:"rgba(255,255,255,0.15)",fontFamily:"sans-serif",margin:"8px 0 0" }}>be the first to leave a note</p>
        </div>
      )}
      {!loading && notes.map(n => (
        <StickyNote key={n.id} note={n} meta={meta} onDragEnd={handleDragEnd} onTap={handleTap} wallRef={wallRef} zoom={zoom} />
      ))}
    </div>
  );

  function NoteList({ notes, loading, onNoteClick }) {
    return (
      <div style={{ height:"100%",overflowY:"auto",overflowX:"hidden",padding:"18px 18px 24px",display:"flex",flexDirection:"column",gap:12,WebkitOverflowScrolling:"touch" }}>
        {loading ? (
          <Spinner />
        ) : notes.length === 0 ? (
          <div style={{ textAlign:"center",marginTop:60,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif",fontSize:13 }}>no notes yet — be the first!</div>
        ) : notes.map((n, i) => {
          const c = STICKY_COLORS[n.colorIdx];
          return (
            <div key={n.id} onClick={() => onNoteClick(n)}
              style={{ animation:`fadeUp 0.3s ease ${Math.min(i,8)*0.04}s both`,background:c.bg,borderRadius:13,padding:"15px 15px 13px",position:"relative",overflow:"hidden",boxShadow:"0 3px 14px rgba(0,0,0,0.22),1px 1px 0 rgba(255,255,255,0.5) inset",cursor:"pointer",userSelect:"none",WebkitUserSelect:"none" }}
            >
              <div style={{ position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(transparent,transparent 23px,${c.lines} 23px,${c.lines} 24px)`,backgroundPosition:"0 32px",opacity:0.4,pointerEvents:"none" }} />
              <div style={{ position:"absolute",top:-5,left:"50%",transform:"translateX(-50%)",width:40,height:13,background:"rgba(255,255,255,0.55)",borderRadius:2 }} />
              <p style={{ margin:0,fontSize:13,lineHeight:1.7,color:c.text,fontFamily:"Georgia,serif",wordBreak:"break-word",paddingTop:7,position:"relative" }}>
                {n.text.length > 140 ? n.text.slice(0,137) + "…" : n.text}
              </p>
              {n.spotifyUrl && (
                <div style={{ marginTop:7,display:"flex",alignItems:"center",gap:5,background:"rgba(0,0,0,0.09)",borderRadius:7,padding:"3px 7px",position:"relative",width:"fit-content" }}>
                  <div style={{ width:14,height:14,borderRadius:3,background:"#1DB954",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{SPOTIFY_ICON}</div>
                  <span style={{ fontSize:9.5,color:c.text,opacity:0.65,fontFamily:"sans-serif" }}>has a song</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (mobile) {
    return (
      <>
        <GlobalStyles bodyCss={bodyCss} />

        <div style={{ display:"flex",flexDirection:"column",width:"100vw",height:"100vh",overflow:"hidden" }}>

          {/* Header */}
          <header style={{ flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 13px",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(255,255,255,0.07)",zIndex:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div>
                <h1 style={{ margin:0,fontSize:16,fontWeight:700,color:"#fff",letterSpacing:"-0.3px",lineHeight:1,fontFamily:"Georgia,serif" }}>unsent wall</h1>
                <p style={{ margin:"1px 0 0",fontSize:9,color:"rgba(255,255,255,0.32)",letterSpacing:"1.3px",textTransform:"uppercase",fontFamily:"sans-serif" }}>anonymous · open</p>
              </div>
              <SaveDot status={saveStatus} />
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <EmotionButton bg={bg} onOpen={() => setShowBgPick(true)} small />
              <ZoomControls zoom={zoom} onZoomOut={() => setZoom(z => clampZoom(z - zoomStep))} onZoomIn={() => setZoom(z => clampZoom(z + zoomStep))} />
              <button
                onClick={() => { setComposing(true); setTimeout(() => textRef.current?.focus(), 80); }}
                style={{ background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"6px 13px",borderRadius:999,fontSize:12.5,cursor:"pointer",fontFamily:"sans-serif",display:"flex",alignItems:"center",gap:5 }}
              >
                <span style={{ fontSize:15,lineHeight:1 }}>+</span> note
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div style={{ flexShrink:0,display:"flex",background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            {[["wall","🗺 wall"],["list","📋 list"]].map(([t,l]) => (
              <button key={t} onClick={() => setMobileTab(t)}
                style={{ flex:1,padding:"8px 0",background:"transparent",border:"none",borderBottom:mobileTab===t?`2px solid ${bg?.config?.accent||"rgba(255,255,255,0.65)"}`:"2px solid transparent",color:mobileTab===t?"#fff":"rgba(255,255,255,0.38)",fontSize:12,fontFamily:"sans-serif",cursor:"pointer",transition:"all 0.16s" }}
              >{l}</button>
            ))}
          </div>

          <div style={{ flex:1,overflow:"hidden",position:"relative" }}>
            {mobileTab === "wall" && (
              <div style={{ height:"100%",overflow:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain" }}>
                <WallCanvas />
              </div>
            )}
            {mobileTab === "list" && (
              <NoteList notes={notes} loading={loading} onNoteClick={setModal} />
            )}
          </div>

          {!loading && (
            <div style={{ position:"absolute",bottom:12,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none",zIndex:50 }}>
              <div style={{ background:"rgba(0,0,0,0.4)",border:`1px solid ${bg?.config?.accent||"rgba(255,255,255,0.1)"}30`,borderRadius:999,padding:"4px 12px",backdropFilter:"blur(8px)" }}>
                <span style={{ fontSize:10.5,color:"rgba(255,255,255,0.4)",fontFamily:"sans-serif" }}>
                  {mobileTab === "wall" ? "drag notes · tap and hold to read" : `${notes.length} notes`}
                </span>
              </div>
            </div>
          )}
        </div>

        {showBgPick && <EmotionBgPicker current={bg} onChange={changeBg} onClose={() => setShowBgPick(false)} />}
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

        {/* Compose sheet — MOBILE */}
        {composing && (
          <div
            onClick={e => { if (e.target === e.currentTarget) setComposing(false); }}
            style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)" }}
          >
            <div style={{ background:col.bg,borderRadius:"20px 20px 0 0",padding:"18px 17px 38px",width:"100%",boxShadow:"0 -6px 36px rgba(0,0,0,0.35)",position:"relative",maxHeight:"92vh",overflowY:"auto" }}>
              <div style={{ position:"absolute",top:9,left:"50%",transform:"translateX(-50%)",width:36,height:4,background:"rgba(0,0,0,0.15)",borderRadius:99 }} />
              <h2 style={{ margin:"10px 0 2px",fontSize:17,fontWeight:700,color:col.text,fontFamily:"Georgia,serif" }}>leave a note</h2>
              <p style={{ margin:"0 0 13px",fontSize:10.5,color:col.text,opacity:0.5,fontFamily:"sans-serif" }}>anonymous · no account · visible to everyone</p>
              <div style={{ display:"flex",gap:9,marginBottom:13 }}>
                {STICKY_COLORS.map((c,i) => (
                  <button key={i} onClick={() => setDraft(d => ({ ...d, colorIdx:i }))}
                    style={{ width:32,height:32,borderRadius:"50%",background:c.bg,border:draft.colorIdx===i?`3px solid ${c.shadow}`:"2px solid rgba(0,0,0,0.12)",cursor:"pointer",transition:"transform 0.14s",transform:draft.colorIdx===i?"scale(1.2)":"scale(1)",flexShrink:0 }} />
                ))}
              </div>
              <textarea
                ref={textRef}
                value={draft.text}
                onChange={e => setDraft(d => ({ ...d, text:e.target.value }))}
                placeholder="write what you never said..."
                rows={5}
                style={{ width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${col.shadow}40`,resize:"none",fontSize:16,fontFamily:"Georgia,serif",color:col.text,outline:"none",lineHeight:1.7,padding:"4px 0",boxSizing:"border-box" }}
              />
              {/* ── Spotify Search ── */}
              <SpotifySearch
                col={col}
                onSelect={handleSpotifySelect}
                initialSelected={null}
              />
              <div style={{ display:"flex",gap:9,marginTop:18 }}>
                <button onClick={() => { setComposing(false); setDraft({ text:"", url:"", colorIdx:0 }); }} style={{ flex:1,padding:"13px 0",borderRadius:11,border:`1.5px solid ${col.shadow}50`,background:"transparent",cursor:"pointer",fontSize:14,fontFamily:"sans-serif",color:col.text }}>cancel</button>
                <button onClick={post} disabled={!draft.text.trim()} style={{ flex:2,padding:"13px 0",borderRadius:11,background:col.shadow,border:"none",cursor:draft.text.trim()?"pointer":"not-allowed",fontSize:14,fontFamily:"sans-serif",color:"#fff",fontWeight:600,opacity:draft.text.trim()?1:0.42,transition:"opacity 0.2s" }}>post to wall</button>
              </div>
            </div>
          </div>
        )}

        {/* Note modal — MOBILE */}
        {modal && (() => {
          const mc  = STICKY_COLORS[modal.colorIdx];
          const emb = getEmbedUrl(modal.spotifyUrl);
          return (
            <div
              onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
              style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)" }}
            >
              <div style={{ background:mc.bg,borderRadius:"20px 20px 0 0",padding:"24px 19px 42px",width:"100%",boxShadow:"0 -6px 48px rgba(0,0,0,0.45)",position:"relative",maxHeight:"88vh",overflowY:"auto" }}>
                <div style={{ position:"absolute",top:9,left:"50%",transform:"translateX(-50%)",width:36,height:4,background:"rgba(0,0,0,0.15)",borderRadius:99 }} />
                <button onClick={() => setModal(null)} style={{ position:"absolute",top:13,right:13,background:"rgba(0,0,0,0.1)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:16,color:mc.text,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
                <div style={{ backgroundImage:`repeating-linear-gradient(transparent,transparent 27px,${mc.lines} 27px,${mc.lines} 28px)`,backgroundPosition:"0 8px",minHeight:80,paddingTop:9,marginBottom:16 }}>
                  <p style={{ margin:0,fontSize:15.5,lineHeight:1.85,color:mc.text,fontFamily:"Georgia,serif",whiteSpace:"pre-wrap" }}>{modal.text}</p>
                </div>
                {emb && <iframe src={emb} width="100%" height={80} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ borderRadius:11,display:"block" }} title="Spotify player" />}
                <p style={{ margin:"12px 0 0",fontSize:10.5,color:mc.text,opacity:0.35,fontFamily:"sans-serif",textAlign:"right" }}>anonymous · unsent wall</p>
              </div>
            </div>
          );
        })()}
      </>
    );
  }

  // ── DESKTOP / TABLET ──────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyles bodyCss={bodyCss} />

      <div style={{ display:"flex",flexDirection:"column",width:"100vw",height:"100vh",overflow:"hidden",position:"relative" }}>

        {/* Header */}
        <header style={{ flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:tablet?"8px 18px":"9px 24px",background:"rgba(0,0,0,0.42)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)",zIndex:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div>
              <h1 style={{ margin:0,fontSize:tablet?18:20,fontWeight:700,color:"#fff",letterSpacing:"-0.4px",lineHeight:1,fontFamily:"Georgia,serif" }}>unsent wall</h1>
              <p style={{ margin:"1px 0 0",fontSize:9.5,color:"rgba(255,255,255,0.32)",letterSpacing:"1.8px",textTransform:"uppercase",fontFamily:"sans-serif" }}>anonymous · public · open</p>
            </div>
            <SaveDot status={saveStatus} />
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.35)",fontFamily:"sans-serif" }}>{notes.length} notes</span>
            <EmotionButton bg={bg} onOpen={() => setShowBgPick(true)} />
            <ZoomControls zoom={zoom} onZoomOut={() => setZoom(z => clampZoom(z - zoomStep))} onZoomIn={() => setZoom(z => clampZoom(z + zoomStep))} />
            <button
              onClick={() => { setComposing(true); setTimeout(() => textRef.current?.focus(), 60); }}
              style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:tablet?"7px 15px":"7px 18px",borderRadius:999,fontSize:tablet?12:13,cursor:"pointer",fontFamily:"sans-serif",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",gap:5 }}
            >
              <span style={{ fontSize:15,lineHeight:1 }}>+</span> leave a note
            </button>
          </div>
        </header>

        <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column" }}>
          <div style={{ flexShrink:0,display:"flex",background:"rgba(0,0,0,0.25)",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            {[["wall","🗺 wall"],["list","📋 list"]].map(([t,label]) => (
              <button key={t} onClick={() => setDesktopTab(t)}
                style={{ flex:1,padding:"10px 0",background:"transparent",border:"none",borderBottom:desktopTab===t?`2px solid ${bg?.config?.accent||"rgba(255,255,255,0.65)"}`:"2px solid transparent",color:desktopTab===t?"#fff":"rgba(255,255,255,0.4)",fontSize:12,fontFamily:"sans-serif",cursor:"pointer",transition:"all 0.16s" }}
              >{label}</button>
            ))}
          </div>
          {desktopTab === "wall" ? (
            <div style={{ flex:1,overflow:"auto" }}>
              <div ref={wallRef} style={{ position:"relative",width:WALL_W,height:WALL_H,...wallStyle,transform:`scale(${zoom})`,transformOrigin:"top left" }}>
                {loading && <Spinner />}
                {!loading && notes.length === 0 && (
                  <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none" }}>
                    <p style={{ fontSize:22,color:"rgba(255,255,255,0.2)",fontFamily:"Georgia,serif",margin:0 }}>the wall is empty</p>
                    <p style={{ fontSize:13,color:"rgba(255,255,255,0.13)",fontFamily:"sans-serif",margin:"10px 0 0" }}>be the first to leave a note</p>
                  </div>
                )}
                {!loading && notes.map(n => (
                  <StickyNote key={n.id} note={n} meta={meta} onDragEnd={handleDragEnd} onTap={handleTap} wallRef={wallRef} zoom={zoom} />
                ))}
              </div>
            </div>
          ) : (
            <NoteList notes={notes} loading={loading} onNoteClick={setModal} />
          )}
        </div>

        {!loading && (
          <div style={{ position:"absolute",bottom:16,right:16,background:"rgba(0,0,0,0.38)",border:`1px solid ${bg?.config?.accent||"rgba(255,255,255,0.1)"}30`,borderRadius:999,padding:"4px 14px",backdropFilter:"blur(8px)",zIndex:50,display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ fontSize:13 }}>{bg?.emoji}</span>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:"sans-serif" }}>feeling {bg?.label?.toLowerCase()} · {notes.length} notes</span>
          </div>
        )}
      </div>

      {showBgPick && <EmotionBgPicker current={bg} onChange={changeBg} onClose={() => setShowBgPick(false)} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {/* Compose modal — DESKTOP */}
      {composing && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setComposing(false); setDraft({ text:"", url:"", colorIdx:0 }); } }}
          style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:tablet?18:24,backdropFilter:"blur(5px)" }}
        >
          <div style={{ background:col.bg,borderRadius:17,padding:tablet?"22px 20px 20px":"26px 24px 22px",width:"100%",maxWidth:tablet?390:430,boxShadow:"0 24px 60px rgba(0,0,0,0.4)",position:"relative",overflow:"visible" }}>
            <div style={{ position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",width:54,height:19,background:"rgba(255,255,255,0.6)",borderRadius:3 }} />
            <h2 style={{ margin:"8px 0 2px",fontSize:17,fontWeight:700,color:col.text,fontFamily:"Georgia,serif" }}>leave a note</h2>
            <p style={{ margin:"0 0 12px",fontSize:10.5,color:col.text,opacity:0.52,fontFamily:"sans-serif" }}>anonymous · no account needed · visible to everyone</p>
            <div style={{ display:"flex",gap:8,marginBottom:12 }}>
              {STICKY_COLORS.map((c,i) => (
                <button key={i} onClick={() => setDraft(d => ({ ...d, colorIdx:i }))}
                  style={{ width:25,height:25,borderRadius:"50%",background:c.bg,border:draft.colorIdx===i?`3px solid ${c.shadow}`:"2px solid rgba(0,0,0,0.12)",cursor:"pointer",transition:"transform 0.14s",transform:draft.colorIdx===i?"scale(1.22)":"scale(1)",flexShrink:0 }} />
              ))}
            </div>
            <textarea
              ref={textRef}
              value={draft.text}
              onChange={e => setDraft(d => ({ ...d, text:e.target.value }))}
              placeholder="write what you never said..."
              rows={5}
              style={{ width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${col.shadow}40`,resize:"none",fontSize:14.5,fontFamily:"Georgia,serif",color:col.text,outline:"none",lineHeight:1.7,padding:"3px 0",boxSizing:"border-box" }}
            />
            {/* ── Spotify Search ── */}
            <SpotifySearch
              col={col}
              onSelect={handleSpotifySelect}
              initialSelected={null}
            />
            <div style={{ display:"flex",gap:9,marginTop:16 }}>
              <button onClick={() => { setComposing(false); setDraft({ text:"", url:"", colorIdx:0 }); }} style={{ flex:1,padding:"10px 0",borderRadius:10,border:`1.5px solid ${col.shadow}50`,background:"transparent",cursor:"pointer",fontSize:13,fontFamily:"sans-serif",color:col.text }}>cancel</button>
              <button onClick={post} disabled={!draft.text.trim()} style={{ flex:2,padding:"10px 0",borderRadius:10,background:col.shadow,border:"none",cursor:draft.text.trim()?"pointer":"not-allowed",fontSize:13,fontFamily:"sans-serif",color:"#fff",fontWeight:600,opacity:draft.text.trim()?1:0.42,transition:"opacity 0.2s" }}>post to wall</button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal — DESKTOP */}
      {modal && (() => {
        const mc  = STICKY_COLORS[modal.colorIdx];
        const emb = getEmbedUrl(modal.spotifyUrl);
        return (
          <div
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
            style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",padding:tablet?18:26,backdropFilter:"blur(6px)" }}
          >
            <div style={{ background:mc.bg,borderRadius:17,padding:tablet?"26px 20px 20px":"30px 26px 22px",width:"100%",maxWidth:tablet?430:470,boxShadow:"0 32px 80px rgba(0,0,0,0.55)",position:"relative",maxHeight:"88vh",overflowY:"auto" }}>
              <div style={{ position:"absolute",top:-9,left:"50%",transform:"translateX(-50%)",width:58,height:19,background:"rgba(255,255,255,0.65)",borderRadius:3 }} />
              <button onClick={() => setModal(null)} style={{ position:"absolute",top:13,right:13,background:"rgba(0,0,0,0.1)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:15,color:mc.text,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
              <div style={{ backgroundImage:`repeating-linear-gradient(transparent,transparent 27px,${mc.lines} 27px,${mc.lines} 28px)`,backgroundPosition:"0 8px",minHeight:80,paddingTop:7,marginBottom:15 }}>
                <p style={{ margin:0,fontSize:16,lineHeight:1.8,color:mc.text,fontFamily:"Georgia,serif",whiteSpace:"pre-wrap" }}>{modal.text}</p>
              </div>
              {emb && <iframe src={emb} width="100%" height={152} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ borderRadius:11,display:"block" }} title="Spotify player" />}
              <p style={{ margin:"13px 0 0",fontSize:10.5,color:mc.text,opacity:0.35,fontFamily:"sans-serif",textAlign:"right" }}>anonymous · unsent wall</p>
            </div>
          </div>
        );
      })()}
    </>
  );
}
