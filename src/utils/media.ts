import type { Message } from "whatsapp-chat-parser";

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
const AUDIO_EXT = /\.(mp3|ogg|opus)$/i;
const TEXT_EXT = /\.txt$/i;
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|csv|zip|rtf|odt)$/i;

export const isImageName = (name: string): boolean => IMAGE_EXT.test(name);
export const isVideoName = (name: string): boolean => VIDEO_EXT.test(name);
export const isAudioName = (name: string): boolean => AUDIO_EXT.test(name);
export const isTextName = (name: string): boolean => TEXT_EXT.test(name);
export const isDocumentName = (name: string): boolean => DOC_EXT.test(name);

/** Recovers a captioned attachment tag (e.g. "name.txt <adjunto: id-name.txt>") that
 * whatsapp-chat-parser misses because its own regex only matches when the tag is the
 * very first thing in the message. */
const ATTACHMENT_TAG_RE = /<[^<>:]+:\s*([^<>]+)>\s*$/;

/** Resolved attachment filename for a message, or null if none. */
export const attachmentNameFor = (message: Message): string | null =>
  message.attachment?.fileName ??
  message.message.match(ATTACHMENT_TAG_RE)?.[1]?.trim() ??
  null;
