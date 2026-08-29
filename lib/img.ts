/**
 * Unsplash source URLs for demo imagery. All photo IDs are verified to
 * resolve; swap for the client's own photography before go-live.
 */
export function unsplash(photoId: string, width = 1600): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=75`;
}
