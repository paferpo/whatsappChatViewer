import { type Component, For, Show } from "solid-js";
import { openNestedTextChat } from "./MessageContent";
import { attachmentItems, type MediaItem } from "../utils/attachments";
import { isAudioName, isImageName, isTextName, isVideoName, objectUrlFor } from "../utils/media";

const parseDate = (date: Date): string => {
  const userLang = navigator.language;
  return date.toLocaleString(userLang, {
    hour: "numeric",
    minute: "numeric",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const DocRow: Component<{ item: MediaItem; onJump?: (index: number) => void }> = (props) => (
  <div class="docs-row">
    <span class="docs-row-icon" aria-hidden="true">📎</span>
    <span class="docs-row-name">{props.item.name}</span>
    <span class="docs-row-date">{parseDate(props.item.message.date)}</span>
    <span class="docs-row-size">{formatBytes(props.item.blob.size)}</span>
    <span class="docs-row-action">
      <Show
        when={isTextName(props.item.name)}
        fallback={
          <a href={objectUrlFor(props.item.blob)} download={props.item.name}>
            Download
          </a>
        }
      >
        <button
          type="button"
          class="docs-row-open"
          onClick={() => openNestedTextChat(props.item.name, props.item.blob)}
        >
          Open
        </button>
      </Show>
    </span>
    {props.onJump && (
      <button
        type="button"
        class="docs-row-jump"
        onClick={() => props.onJump?.(props.item.index)}
      >
        Go to message
      </button>
    )}
  </div>
);

const DocsGallery: Component<{ onJump?: (index: number) => void }> = (props) => {
  const items = () =>
    attachmentItems().filter(
      ({ name }) => !isImageName(name) && !isVideoName(name) && !isAudioName(name),
    );

  return (
    <Show
      when={items().length > 0}
      fallback={<p class="gallery-empty">No documents in this chat</p>}
    >
      <div class="docs-list">
        <For each={items()}>{(item) => <DocRow item={item} onJump={props.onJump} />}</For>
      </div>
    </Show>
  );
};

export default DocsGallery;
