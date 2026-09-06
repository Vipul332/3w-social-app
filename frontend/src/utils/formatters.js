/**
 * Formats an ISO date string as a short, human-friendly relative time
 * (e.g. "5m ago", "3h ago"), falling back to an absolute date for older
 * posts. Used on the feed where scanability matters more than precision.
 */
export const formatRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Formats an ISO date string as an absolute, precise timestamp
 * (e.g. "Sep 5, 10:42 AM"). Used for comments, where exact time is
 * more useful than relative time in a scrollable thread.
 */
export const formatAbsoluteTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Returns up to two uppercase initials for an avatar, from a display name.
 */
export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
