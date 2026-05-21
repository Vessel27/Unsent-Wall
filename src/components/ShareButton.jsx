import { FacebookShareButton, FacebookIcon } from "react-share";
import { incrementNoteShares } from "../lib/dbHelpers";

export default function ShareButton({ noteId, noteText, shares, style }) {
    const baseUrl = "https://unsent-wall.vercel.app";
    const url = noteId ? `${baseUrl}?note=${noteId}` : baseUrl;

    return (
        <FacebookShareButton
            url={url}
            quote={noteText ?? ""}
            hashtag="#unsentwall"
            style={{ outline: "none", ...style }}
            onClick={() => { if (noteId && !noteId.startsWith("temp-")) incrementNoteShares(noteId); }}
        >
            <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(24,119,242,0.15)",
                border: "1px solid rgba(24,119,242,0.4)",
                borderRadius: 999, padding: "3px 8px",
                cursor: "pointer", fontSize: 11,
                color: "#fff", fontFamily: "sans-serif", lineHeight: 1,
            }}>
                <FacebookIcon size={16} round />
                share{shares > 0 ? ` ${shares}` : ""}
            </div>
        </FacebookShareButton>
    );
}
