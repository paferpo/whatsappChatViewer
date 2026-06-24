/**
 * Lazily creates and caches object URLs for media Blobs so each Blob is only
 * objectified once, and lets us revoke them all when a new chat is loaded.
 */
const urlCache = new Map<Blob, string>();

export const objectUrlFor = (blob: Blob): string => {
  let url = urlCache.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    urlCache.set(blob, url);
  }
  return url;
};

export const revokeAllObjectUrls = (): void => {
  for (const url of urlCache.values()) {
    URL.revokeObjectURL(url);
  }
  urlCache.clear();
};

const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;

export const isImageName = (name: string): boolean => IMAGE_EXT.test(name);
export const isVideoName = (name: string): boolean => VIDEO_EXT.test(name);
