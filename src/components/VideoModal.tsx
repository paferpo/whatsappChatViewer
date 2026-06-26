import { type Component, createSignal, Show } from "solid-js";

const [activeUrl, setActiveUrl] = createSignal<string | null>(null);

/** Open the full-size video modal for the given (object) URL. */
export const openVideo = (url: string): void => {
  setActiveUrl(url);
};

const close = (): void => {
  setActiveUrl(null);
};

/** Single modal instance; mount once near the app root. Provides an in-app
 * fullscreen experience that does not rely on the browser Fullscreen API,
 * which is unreliable inside the Tauri WebView. */
const VideoModal: Component = () => (
  <Show when={activeUrl()}>
    <div class="modal is-active" onClick={close}>
      <div class="modal-background"></div>
      <div class="modal-content video-modal-content" onClick={(e) => e.stopPropagation()}>
        <video src={activeUrl()!} controls autoplay class="video-modal-player" />
      </div>
      <button class="modal-close is-large" aria-label="close" onClick={close} />
    </div>
  </Show>
);

export default VideoModal;
