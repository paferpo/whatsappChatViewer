import { type Component, createSignal, For, Show } from "solid-js";
import type { Message } from "whatsapp-chat-parser";
import MessageContent from "./MessageContent";

type Active =
  | { title: string; messages: Message[] }
  | { title: string; rawText: string }
  | null;

const [active, setActive] = createSignal<Active>(null);

/** Open the nested-chat modal showing parsed WhatsApp messages. */
export const openTextChat = (title: string, messages: Message[]): void => {
  setActive({ title, messages });
};

/** Open the nested-chat modal showing a plain-text fallback. */
export const openTextChatRaw = (title: string, rawText: string): void => {
  setActive({ title, rawText });
};

const close = (): void => {
  setActive(null);
};

/** Pick a default "primary" participant the same way Viewer.tsx does. */
const primaryAuthor = (messages: Message[]): string => {
  const participants = [
    ...new Set(
      messages
        .map((m) => m.author)
        .filter((a): a is string => !!a && a !== "System"),
    ),
  ];
  return participants.includes("Pablete") ? "Pablete" : participants[0] ?? "";
};

/** Single modal instance; mount once near the app root. */
const TextChatModal: Component = () => {
  const primary = () => {
    const a = active();
    return a && "messages" in a ? primaryAuthor(a.messages) : "";
  };

  const isChained = (messages: Message[], index: number): boolean => {
    const last = index - 1;
    return last >= 0 && messages[index].author === messages[last].author;
  };

  return (
    <Show when={active()}>
      {(a) => (
        <div class="modal is-active" onClick={close}>
          <div class="modal-background"></div>
          <div
            class="modal-content text-chat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <p class="text-chat-modal-title">{a().title}</p>
            <Show
              when={"messages" in a() ? (a() as { messages: Message[] }).messages : null}
              fallback={<pre class="text-chat-modal-raw">{(a() as { rawText: string }).rawText}</pre>}
            >
              {(messages) => (
                <div class="wa-container">
                  <For each={messages()}>
                    {(message, i) => {
                      const chained = isChained(messages(), i());
                      const isPrimary = message.author === primary();
                      return (
                        <div class="msg">
                          <div
                            class="bubble"
                            classList={{
                              alt: isPrimary && !chained,
                              follow: chained && !isPrimary,
                              altfollow: isPrimary && chained,
                            }}
                          >
                            <div class="txt">
                              {!chained && <p class="name">{message.author}</p>}
                              <MessageContent message={message} chained={chained} />
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              )}
            </Show>
          </div>
          <button class="modal-close is-large" aria-label="close" onClick={close} />
        </div>
      )}
    </Show>
  );
};

export default TextChatModal;
