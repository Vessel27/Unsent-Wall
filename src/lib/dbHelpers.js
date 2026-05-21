import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export async function loadNotes() {
  try {
    const q = query(collection(db, "wallNotes"), orderBy("createdAt", "desc"));
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
        comments: payload.comments ?? [],
        reactions: payload.reactions ?? {},
        ...payload
      };
    });
  } catch (e) {
    console.error("loadNotes:", e);
    return [];
  }
}

export async function saveNote(note) {
  try {
    const ref = await addDoc(collection(db, "wallNotes"), note);
    return ref.id;
  } catch (e) {
    console.error("saveNote:", e);
    return null;
  }
}

export async function updateNotePosition(id, x, y, zIndex) {
  try {
    await updateDoc(doc(db, "wallNotes", id), { x, y, zIndex });
  } catch (e) {
    console.error("updateNotePosition:", e);
  }
}

export async function updateNoteComments(id, comments) {
  try {
    await updateDoc(doc(db, "wallNotes", id), { comments });
  } catch (e) {
    console.error("updateNoteComments:", e);
  }
}

export async function updateNoteReactions(id, reactions) {
  try {
    await updateDoc(doc(db, "wallNotes", id), { reactions });
  } catch (e) {
    console.error("updateNoteReactions:", e);
  }
}

/**
 * Atomically increment or decrement the heart count on a note.
 * Using Firestore increment() prevents race conditions and stale-read overwrites.
 */
export async function incrementNoteHeart(id, delta) {
  try {
    await updateDoc(doc(db, "wallNotes", id), {
      "reactions.❤️": increment(delta)
    });
  } catch (e) {
    console.error("incrementNoteHeart:", e);
  }
}

export async function incrementNoteShares(id) {
  try {
    await updateDoc(doc(db, "wallNotes", id), { shares: increment(1) });
  } catch (e) {
    console.error("incrementNoteShares:", e);
  }
}

export async function loadBg() {
  try {
    const snap = await getDoc(doc(db, "wall", "bg"));
    if (snap.exists()) {
      return snap.data().value ?? null;
    }
  } catch (e) {
    console.error("loadBg:", e);
  }
  return null;
}

export async function saveBg(bg) {
  try {
    await setDoc(doc(db, "wall", "bg"), { value: bg });
  } catch (e) {
    console.error("saveBg:", e);
  }
}
