export function formatRelativeTime(timestamp) {
  if (!timestamp) return "just now";
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) {
    const minutes = Math.max(1, Math.round(diff / minute));
    return `${minutes}m`;
  }
  if (diff < day) {
    const hours = Math.max(1, Math.round(diff / hour));
    return `${hours}h`;
  }

  const days = Math.max(1, Math.round(diff / day));
  return `${days}d`;
}
