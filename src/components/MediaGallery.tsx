import { type Component, For, Show } from "solid-js";
import { attachmentItems, type MediaItem } from "../utils/attachments";
import { isAudioName, isImageName, isVideoName, objectUrlFor } from "../utils/media";
import { openImage } from "./ImageModal";

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

const MediaTile: Component<{ item: MediaItem; onJump?: (index: number) => void }> = (props) => (
  <div class="media-tile">
    <Show when={isImageName(props.item.name)}>
      <img
        class="media-tile-thumb"
        src={objectUrlFor(props.item.blob)}
        alt={props.item.name}
        loading="lazy"
        onClick={() => openImage(objectUrlFor(props.item.blob))}
      />
    </Show>
    <Show when={isVideoName(props.item.name)}>
      <video class="media-tile-video" src={objectUrlFor(props.item.blob)} controls preload="metadata" />
    </Show>
    <Show when={isAudioName(props.item.name)}>
      <div class="media-tile-audio">
        <span class="attachment-audio-icon" aria-hidden="true">🎤</span>
        <audio src={objectUrlFor(props.item.blob)} controls preload="metadata" />
      </div>
    </Show>
    <div class="media-tile-footer">
      <span class="media-tile-date">{parseDate(props.item.message.date)}</span>
      {props.onJump && (
        <button
          type="button"
          class="media-tile-jump"
          onClick={() => props.onJump?.(props.item.index)}
        >
          Go to message
        </button>
      )}
    </div>
  </div>
);

const MediaGallery: Component<{ onJump?: (index: number) => void }> = (props) => {
  const items = () =>
    attachmentItems().filter(
      ({ name }) => isImageName(name) || isVideoName(name) || isAudioName(name),
    );

  return (
    <Show
      when={items().length > 0}
      fallback={<p class="gallery-empty">No media in this chat</p>}
    >
      <div class="media-gallery">
        <For each={items()}>{(item) => <MediaTile item={item} onJump={props.onJump} />}</For>
      </div>
    </Show>
  );
};

export default MediaGallery;
