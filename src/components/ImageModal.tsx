import { type Component, createSignal, Show } from "solid-js";

const [activeUrl, setActiveUrl] = createSignal<string | null>(null);

/** Open the full-size image modal for the given (object) URL. */
export const openImage = (url: string): void => setActiveUrl(url);

const close = (): void => setActiveUrl(null);

/** Single modal instance; mount once near the app root. */
const ImageModal: Component = () => (
  <Show when={activeUrl()}>
    <div class="modal is-active" onClick={close}>
      <div class="modal-background"></div>
      <div class="modal-content image-modal-content">
        <img src={activeUrl()!} alt="Attachment" />
      </div>
      <button class="modal-close is-large" aria-label="close" onClick={close} />
    </div>
  </Show>
);

export default ImageModal;
