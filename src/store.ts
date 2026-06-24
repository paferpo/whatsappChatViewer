import { createStore } from "solid-js/store";
import type { Message } from "whatsapp-chat-parser";

export interface ChatState {
  messages: Message[];
  /** Attachment file name (basename) -> Blob, populated from a ZIP export. */
  media: Map<string, Blob>;
}

const store = createStore<ChatState>({ messages: [], media: new Map() });

export default store;
