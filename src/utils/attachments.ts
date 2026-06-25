import type { Message } from "whatsapp-chat-parser";
import store from "../store";
import { attachmentNameFor } from "./media";

export interface MediaItem {
  name: string;
  blob: Blob;
  message: Message;
  index: number;
}

/** All chat messages that resolve to an attachment with media available, in chat order. */
export const attachmentItems = (): MediaItem[] =>
  store[0].messages
    .map((message, index) => {
      const name = attachmentNameFor(message);
      const blob = name ? store[0].media.get(name) : undefined;
      return name && blob ? { name, blob, message, index } : null;
    })
    .filter((x): x is MediaItem => x !== null);
