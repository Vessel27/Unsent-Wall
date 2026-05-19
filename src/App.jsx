import { useState, useRef, useEffect, useCallback } from "react";
import { loadNotes, saveNote, updateNotePosition, updateNoteComments, updateNoteReactions, incrementNoteHeart, loadBg, saveBg } from "./lib/dbHelpers";
import { STICKY_COLORS, EMOTION_BACKGROUNDS, buildWallStyle, buildBodyCss } from "./lib/wallThemes";
import useBreakpoint from "./hooks/useBreakpoint";
import GlobalStyles from "./components/GlobalStyles";
import SaveDot from "./components/SaveDot";
import EmotionButton from "./components/EmotionButton";
import ZoomControls from "./components/ZoomControls";
import EmotionBgPicker from "./components/EmotionBgPicker";
import NoteList from "./components/NoteList";
import WelcomeModal from "./components/WelcomeModal";
import NoteComposer from "./components/NoteComposer";
import NoteModal from "./components/NoteModal";
import WallCanvas from "./components/WallCanvas";
import { FontAwesomeIcon, faPlus, faMap, faList } from "./lib/faIcons";

let gZ = 20;

export default function UnsentWall() {
  const bp = useBreakpoint();
  const mobile = bp === "mobile" || bp === "mobileLg";
  const tablet = bp === "tablet";

  const WALL_W = 3200;
  const WALL_H = 1800;
  const welcomeSeenKey = "unsentWallWelcomeSeen";

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bg, setBg] = useState(EMOTION_BACKGROUNDS[1]);
  const [showBgPick, setShowBgPick] = useState(false);
  const [modal, setModal] = useState(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ text: "", url: "", colorIdx: 0 });
  const [meta, setMeta] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle");
  const [mobileTab, setMobileTab] = useState("wall");
  const [desktopTab, setDesktopTab] = useState("wall");
  const [showWelcome, setShowWelcome] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [userReactions, setUserReactions] = useState(() => {
    try {
      const stored = window.localStorage.getItem("unsentWallUserReactions");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const wallRef = useRef(null);
  const textRef = useRef(null);

  // Persist liked state across page refreshes
  useEffect(() => {
    try {
      window.localStorage.setItem("unsentWallUserReactions", JSON.stringify(userReactions));
    } catch {}
  }, [userReactions]);

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

  const fetchMeta = useCallback(async (url) => {
    if (!url || meta[url]) return;
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!response.ok) return;
      const data = await response.json();
      setMeta(p => ({ ...p, [url]: { title: data.title, cover: data.thumbnail_url } }));
    } catch {}
  }, [meta]);

  useEffect(() => {
    notes.forEach(n => n.spotifyUrl && fetchMeta(n.spotifyUrl));
  }, [notes, fetchMeta]);

  const handleDragEnd = useCallback(async (id, x, y) => {
    gZ++;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y, zIndex: gZ } : n));
    await updateNotePosition(id, x, y, gZ);
  }, []);

  const handleTap = useCallback((note) => { setModal(note); }, []);
  const changeBg = useCallback((newBg) => { setBg(newBg); saveBg(newBg); }, []);

  const handleSpotifySelect = useCallback((url, trackMeta) => {
    setDraft(d => ({ ...d, url }));
    if (url && trackMeta) {
      setMeta(p => ({ ...p, [url]: trackMeta }));
    }
  }, []);

  const handleAddComment = useCallback(async (noteId, commentText) => {
    const text = commentText.trim();
    if (!text) return;

    const comment = {
      id: `comment-${Date.now()}`,
      text,
      createdAt: Date.now(),
      reactions: {}
    };

    const existingComments = notes.find(n => n.id === noteId)?.comments ?? modal?.comments ?? [];
    const updatedComments = [...existingComments, comment];

    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, comments: updatedComments } : n));
    setModal(prev => prev?.id === noteId ? { ...prev, comments: updatedComments } : prev);

    if (!noteId.startsWith("temp-")) {
      await updateNoteComments(noteId, updatedComments);
    }
  }, [modal, notes]);

  const handleReactNote = useCallback(async (noteId) => {
    const emoji = "❤️";

    // Read the current liked state from the functional updater to avoid stale closure
    setUserReactions(prevUserReactions => {
      const isLiked = prevUserReactions[noteId] === emoji;
      const delta = isLiked ? -1 : 1;

      // Update local notes state optimistically
      setNotes(prevNotes => prevNotes.map(n => {
        if (n.id !== noteId) return n;
        const current = n.reactions?.["❤️"] ?? 0;
        const next = Math.max(0, current + delta);
        return { ...n, reactions: { ...n.reactions, "❤️": next } };
      }));

      // Update modal if open
      setModal(prev => {
        if (!prev || prev.id !== noteId) return prev;
        const current = prev.reactions?.["❤️"] ?? 0;
        const next = Math.max(0, current + delta);
        return { ...prev, reactions: { ...prev.reactions, "❤️": next } };
      });

      // Persist atomically to Firestore (no stale read-modify-write)
      if (!noteId.startsWith("temp-")) {
        incrementNoteHeart(noteId, delta);
      }

      // Return updated userReactions
      if (isLiked) {
        const next = { ...prevUserReactions };
        delete next[noteId];
        return next;
      } else {
        return { ...prevUserReactions, [noteId]: emoji };
      }
    });
  }, []);

  const handleReactComment = useCallback(async (noteId, commentId, emoji) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const reactionKey = `${noteId}-${commentId}`;
    const userReactionEmoji = userReactions[reactionKey];

    const updatedComments = note.comments.map(c => {
      if (c.id !== commentId) return c;

      const current = c.reactions || {};

      if (userReactionEmoji === emoji) {
        // User already reacted with this emoji, remove it (toggle off)
        const updated = { ...current };
        delete updated[emoji];
        return { ...c, reactions: updated };
      } else {
        // User reacting with a different emoji, replace previous reaction
        const updated = current;
        if (userReactionEmoji) {
          delete updated[userReactionEmoji];
        }
        const count = updated[emoji] ?? 0;
        return { ...c, reactions: { ...updated, [emoji]: count + 1 } };
      }
    });

    // Update user reactions tracker
    const newUserReactions = { ...userReactions };
    if (userReactionEmoji === emoji) {
      delete newUserReactions[reactionKey];
    } else {
      newUserReactions[reactionKey] = emoji;
    }
    setUserReactions(newUserReactions);

    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, comments: updatedComments } : n));
    setModal(prev => prev?.id === noteId ? { ...prev, comments: updatedComments } : prev);

    if (!noteId.startsWith("temp-")) {
      await updateNoteComments(noteId, updatedComments);
    }
  }, [modal, notes, userReactions]);

  const handlePost = async () => {
    if (!draft.text.trim()) return;

    gZ++;
    const newNote = {
      text: draft.text,
      spotifyUrl: draft.url,
      colorIdx: draft.colorIdx,
      x: 20 + Math.random() * (WALL_W - 220),
      y: 20 + Math.random() * (WALL_H - 320),
      zIndex: gZ,
      createdAt: Date.now(),
      comments: []
    };

    const tempId = `temp-${Date.now()}`;
    setNotes(prev => [{ ...newNote, id: tempId }, ...prev]);
    setSaveStatus("saving");

    const realId = await saveNote(newNote);
    if (realId) {
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: realId } : n));
      setSaveStatus("saved");
    } else {
      setNotes(prev => prev.filter(n => n.id !== tempId));
      setSaveStatus("idle");
    }

    setTimeout(() => setSaveStatus("idle"), 1500);
    setDraft({ text: "", url: "", colorIdx: 0 });
    setComposing(false);
  };

  const closeComposer = () => {
    setComposing(false);
    setDraft({ text: "", url: "", colorIdx: 0 });
  };

  const clampZoom = (value) => Math.min(1.4, Math.max(0.72, value));
  const zoomStep = 0.14;
  const col = STICKY_COLORS[draft.colorIdx];
  const wallStyle = buildWallStyle(bg);
  const bodyCss = buildBodyCss(bg);

  if (mobile) {
    return (
      <>
        <GlobalStyles bodyCss={bodyCss} />

        <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden" }}>
          <header style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 13px", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1, fontFamily: "Georgia,serif", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>unsent wall</h1>
                <p style={{ margin: "1px 0 0", fontSize: 9, color: "rgba(255,255,255,0.32)", letterSpacing: "1.3px", textTransform: "uppercase", fontFamily: "sans-serif" }}>anonymous � open</p>
              </div>
              <SaveDot status={saveStatus} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <EmotionButton bg={bg} onOpen={() => setShowBgPick(true)} small />
              <ZoomControls zoom={zoom} onZoomOut={() => setZoom(z => clampZoom(z - zoomStep))} onZoomIn={() => setZoom(z => clampZoom(z + zoomStep))} />
              <button
                onClick={() => { setComposing(true); setTimeout(() => textRef.current?.focus(), 80); }}
                style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px 13px", borderRadius: 999, fontSize: 12.5, cursor: "pointer", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 5 }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />
                note
              </button>
            </div>
          </header>

          <div style={{ flexShrink: 0, display: "flex", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[["wall", faMap, "wall"], ["list", faList, "list"]].map(([t, icon, label]) => (
              <button key={t} onClick={() => setMobileTab(t)}
                style={{ flex: 1, padding: "8px 0", background: "transparent", border: "none", borderBottom: mobileTab === t ? `2px solid ${bg?.config?.accent || "rgba(255,255,255,0.65)"}` : "2px solid transparent", color: mobileTab === t ? "#fff" : "rgba(255,255,255,0.38)", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", transition: "all 0.16s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              ><FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />{label}</button>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative" }}>
            {mobileTab === "wall" ? (
              <div style={{ height: "100%", overflow: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
                <WallCanvas
                  wallRef={wallRef}
                  wallStyle={wallStyle}
                  loading={loading}
                  notes={notes}
                  meta={meta}
                  onDragEnd={handleDragEnd}
                  onTap={handleTap}
                  onReactNote={handleReactNote}
                  userReactions={userReactions}
                  zoom={zoom}
                  width={WALL_W}
                  height={WALL_H}
                />
              </div>
            ) : (
              <NoteList notes={notes} loading={loading} onNoteClick={setModal} />
            )}
          </div>

          {!loading && (
            <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
              <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${bg?.config?.accent || "rgba(255,255,255,0.1)"}30`, borderRadius: 999, padding: "4px 12px", backdropFilter: "blur(8px)" }}>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                  {mobileTab === "wall" ? "drag notes � tap and hold to read" : `${notes.length} notes`}
                </span>
              </div>
            </div>
          )}
        </div>

        {showBgPick && <EmotionBgPicker current={bg} onChange={changeBg} onClose={() => setShowBgPick(false)} />}
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} col={col} bg={bg} />}
        {composing && (
          <NoteComposer
            variant="mobile"
            tablet={tablet}
            col={col}
            draft={draft}
            setDraft={setDraft}
            onPost={handlePost}
            onCancel={closeComposer}
            onSpotifySelect={handleSpotifySelect}
          />
        )}
        {modal && <NoteModal modal={modal} onClose={() => setModal(null)} variant="mobile" tablet={tablet} onAddComment={handleAddComment} onReactComment={handleReactComment} onReactNote={handleReactNote} userReactions={userReactions} />}
      </>
    );
  }

  return (
    <>
      <GlobalStyles bodyCss={bodyCss} />

      <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
        <header style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: tablet ? "8px 18px" : "9px 24px", background: "rgba(0,0,0,0.42)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: tablet ? 18 : 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1, fontFamily: "Georgia,serif", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>unsent wall</h1>
              <p style={{ margin: "1px 0 0", fontSize: 9.5, color: "rgba(255,255,255,0.32)", letterSpacing: "1.8px", textTransform: "uppercase", fontFamily: "sans-serif" }}>anonymous � public � open</p>
            </div>
            <SaveDot status={saveStatus} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>{notes.length} notes</span>
            <EmotionButton bg={bg} onOpen={() => setShowBgPick(true)} />
            <ZoomControls zoom={zoom} onZoomOut={() => setZoom(z => clampZoom(z - zoomStep))} onZoomIn={() => setZoom(z => clampZoom(z + zoomStep))} />
            <button
              onClick={() => { setComposing(true); setTimeout(() => textRef.current?.focus(), 60); }}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: tablet ? "7px 15px" : "7px 18px", borderRadius: 999, fontSize: tablet ? 12 : 13, cursor: "pointer", fontFamily: "sans-serif", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", gap: 5 }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} /> leave a note
            </button>
          </div>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flexShrink: 0, display: "flex", background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {[["wall", faMap, "wall"], ["list", faList, "list"]].map(([t, icon, label]) => (
              <button key={t} onClick={() => setDesktopTab(t)}
                style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", borderBottom: desktopTab === t ? `2px solid ${bg?.config?.accent || "rgba(255,255,255,0.65)"}` : "2px solid transparent", color: desktopTab === t ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "sans-serif", cursor: "pointer", transition: "all 0.16s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              ><FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />{label}</button>
            ))}
          </div>

          {desktopTab === "wall" ? (
            <div style={{ flex: 1, overflow: "auto" }}>
              <WallCanvas
                wallRef={wallRef}
                wallStyle={wallStyle}
                loading={loading}
                notes={notes}
                meta={meta}
                onDragEnd={handleDragEnd}
                onTap={handleTap}
                onReactNote={handleReactNote}
                userReactions={userReactions}
                zoom={zoom}
                width={WALL_W}
                height={WALL_H}
              />
            </div>
          ) : (
            <NoteList notes={notes} loading={loading} onNoteClick={setModal} />
          )}
        </div>

        {!loading && (
          <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(0,0,0,0.38)", border: `1px solid ${bg?.config?.accent || "rgba(255,255,255,0.1)"}30`, borderRadius: 999, padding: "4px 14px", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>{bg?.emoji}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>feeling {bg?.label?.toLowerCase()} � {notes.length} notes</span>
          </div>
        )}
      </div>

      {showBgPick && <EmotionBgPicker current={bg} onChange={changeBg} onClose={() => setShowBgPick(false)} />}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} col={col} bg={bg} />}
      {composing && (
        <NoteComposer
          variant="desktop"
          tablet={tablet}
          col={col}
          draft={draft}
          setDraft={setDraft}
          onPost={handlePost}
          onCancel={closeComposer}
          onSpotifySelect={handleSpotifySelect}
        />
      )}
      {modal && <NoteModal modal={modal} onClose={() => setModal(null)} variant="desktop" tablet={tablet} onAddComment={handleAddComment} onReactComment={handleReactComment} onReactNote={handleReactNote} userReactions={userReactions} />}
    </>
  );
}
