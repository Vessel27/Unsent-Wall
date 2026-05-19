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

export function buildWallStyle(bg) {
  if (!bg) return {};
  const { stops, angle, pattern, patternColor } = bg.config;
  const grad = `linear-gradient(${angle}deg,${stops.join(",")})`;
  const pat = buildPatternSvg(pattern, patternColor || "#ffffff");
  return { background: grad, backgroundImage: pat !== "none" ? `${pat},${grad}` : grad };
}

export function buildBodyCss(bg) {
  if (!bg) return "";
  const { stops, angle, pattern, patternColor } = bg.config;
  const grad = `linear-gradient(${angle}deg,${stops.join(",")})`;
  const pat = buildPatternSvg(pattern, patternColor || "#ffffff");
  const bgImg = pat !== "none" ? `${pat},${grad}` : grad;
  return `background:${stops[0]};background-image:${bgImg};`;
}

export function normalizeSpotifyUrl(value) {
  if (!value) return null;
  const trimmed = value.trim();
  const openMatch = trimmed.match(/^(https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+))(\?.*)?$/i);
  if (openMatch) return openMatch[1];
  const uriMatch = trimmed.match(/^spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)$/i);
  if (uriMatch) return `https://open.spotify.com/${uriMatch[1]}/${uriMatch[2]}`;
  return null;
}

export function getEmbedUrl(url) {
  const m = url?.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
}

export { STICKY_COLORS, EMOTION_BACKGROUNDS };
