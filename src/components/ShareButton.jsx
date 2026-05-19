import { FacebookShareButton, FacebookIcon } from "react-share";

export default function ShareButton({ noteId, noteText, style }) {
    const baseUrl = "https://unsent-wall.vercel.app";

    // Always use the clean URL with the note query param.
    // Facebook's scraper will read og:tags from the page; the ?note= param
    // ensures the correct note is highlighted when a visitor lands on the link.
    const url = noteId
        ? `${baseUrl}?note=${noteId}`
        : baseUrl;

    return (
        <FacebookShareButton
            url={url}
            quote={noteText ?? ""}
            hashtag="#unsentwall"
            style={{ outline: "none", ...style }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(24,119,242,0.15)",
                    border: "1px solid rgba(24,119,242,0.4)",
                    borderRadius: 999,
                    padding: "3px 8px",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "#fff",
                    fontFamily: "sans-serif",
                    lineHeight: 1,
                }}
            >
                <FacebookIcon size={16} round />
                share
            </div>
        </FacebookShareButton>
    );
}