import { useState, useCallback } from "react";
import { normalizeSpotifyUrl } from "../lib/wallThemes";
import { FontAwesomeIcon, faMusic, faTimes } from "../lib/faIcons";

const SPOTIFY_ICON = <FontAwesomeIcon icon={faMusic} style={{ fontSize: 10 }} />;

export default function SpotifySearch({ col, onSelect, initialSelected }) {
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
    <div style={{ marginTop: 12 }}>
      <label style={{ fontSize: 11.5, fontFamily: "sans-serif", color: col.text, opacity: 0.55, display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
        <FontAwesomeIcon icon={faMusic} style={{ fontSize: 12 }} />
        Add a song (optional)
      </label>

      {selectedUrl ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.09)", borderRadius: 10, padding: "10px 12px" }}>
          {selectedMeta?.cover ? (
            <img src={selectedMeta.cover} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 18, color: col.text }}>🎵</span>
            </div>
          )}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 12.5, color: col.text, fontFamily: "sans-serif", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130, lineHeight: 1.3 }}>
              {selectedMeta?.title || "Spotify link added"}
            </div>
            <div style={{ fontSize: 10.5, color: col.text, opacity: 0.6, fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedUrl}
            </div>
          </div>
          <button
            onClick={handleClear}
            type="button"
            style={{ background: "rgba(0,0,0,0.12)", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ color: col.text, fontSize: 12 }} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Paste Spotify link here..."
            style={{ width: "100%", background: "rgba(0,0,0,0.09)", border: "none", borderRadius: 8, padding: "10px 100px 10px 12px", fontSize: 16, fontFamily: "sans-serif", color: col.text, outline: "none", boxSizing: "border-box" }}
          />
          <button
            type="submit"
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "8px 12px", borderRadius: 8, border: "none", background: col.shadow, color: "#fff", fontSize: 12, cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : 0.5 }}
            disabled={!input.trim()}
          >
            {loading ? "checking…" : "add"}
          </button>
        </form>
      )}

      {errorMsg && (
        <p style={{ margin: "8px 0 0", fontSize: 10.5, color: col.text, opacity: 0.6, fontFamily: "sans-serif" }}>{errorMsg}</p>
      )}
      {!errorMsg && !selectedUrl && (
        <p style={{ margin: "8px 0 0", fontSize: 10.5, color: col.text, opacity: 0.45, fontFamily: "sans-serif" }}>Supported Spotify URLs: track, album, playlist, episode.</p>
      )}
    </div>
  );
}
