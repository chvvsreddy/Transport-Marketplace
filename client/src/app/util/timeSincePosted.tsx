export const timeSincePosted = (timestampStr: string): string => {
  const timestamp = new Date(timestampStr);
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Posted just now";
  if (days >= 1) return `Posted ${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `Posted ${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `Posted ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
};
