import { unzip } from "fflate";

export interface ExtractedChat {
  /** Raw text of the chat `.txt` file. */
  text: string;
  /** Map of attachment file name (basename) to its Blob. */
  media: Map<string, Blob>;
}

/** Guess a MIME type from a file name so object URLs render/download sensibly. */
const mimeFromName = (name: string): string => {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    m4v: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    opus: "audio/ogg",
    pdf: "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
};

const basename = (path: string): string => path.split("/").pop() ?? path;

/**
 * Unzip a WhatsApp export entirely in memory.
 * Locates the chat text file (prefers `_chat.txt`) and exposes every other
 * entry as a Blob keyed by its base file name.
 */
export const extractChatZip = (buffer: Uint8Array): Promise<ExtractedChat> =>
  new Promise((resolve, reject) => {
    unzip(buffer, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const entries = Object.entries(files).filter(
        ([name]) =>
          // Skip directory entries and macOS AppleDouble metadata junk.
          !name.endsWith("/") &&
          !name.startsWith("__MACOSX/") &&
          !basename(name).startsWith("._"),
      );

      const txtEntries = entries.filter(([name]) =>
        name.toLowerCase().endsWith(".txt"),
      );
      const chatEntry =
        txtEntries.find(([name]) => basename(name).toLowerCase() === "_chat.txt") ??
        txtEntries[0];

      if (!chatEntry) {
        reject(new Error("No .txt chat file found in the ZIP archive."));
        return;
      }

      const text = new TextDecoder("utf-8").decode(chatEntry[1]);

      const media = new Map<string, Blob>();
      for (const [name, data] of entries) {
        if (name === chatEntry[0]) continue;
        media.set(
          basename(name),
          new Blob([data as BlobPart], { type: mimeFromName(name) }),
        );
      }

      resolve({ text, media });
    });
  });
