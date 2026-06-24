import { type Component, createSignal, For, Show } from "solid-js";
import type { Message } from "whatsapp-chat-parser";
import store from "../store";
import { isImageName, isVideoName, objectUrlFor } from "../utils/media";
import { openImage } from "./ImageModal";

const URL_RE = /(https?:\/\/[^\s]+)/g;

/** Strip trailing punctuation that commonly hugs a URL in prose. */
const cleanUrl = (url: string): string => url.replace(/[.,!?)\]]+$/, "");

const isImageUrl = (url: string): boolean => {
  try {
    return isImageName(new URL(url).pathname);
  } catch {
    return false;
  }
};

const youTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
};

type Part =
  | { type: "text"; value: string }
  | { type: "link"; url: string };

const tokenize = (text: string): Part[] => {
  const parts: Part[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push({ type: "text", value: text.slice(last, idx) });
    parts.push({ type: "link", url: cleanUrl(match[0]) });
    last = idx + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
};

const YouTubeEmbed: Component<{ id: string }> = (props) => {
  const [playing, setPlaying] = createSignal(false);
  return (
    <Show
      when={playing()}
      fallback={
        <button
          type="button"
          class="link-preview youtube-preview"
          onClick={() => setPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${props.id}/hqdefault.jpg`}
            alt="YouTube thumbnail"
          />
          <span class="youtube-play">▶</span>
        </button>
      }
    >
      <div class="youtube-embed">
        <iframe
          src={`https://www.youtube.com/embed/${props.id}?autoplay=1`}
          title="YouTube video"
          allow="accelerated-encoder; autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        />
      </div>
    </Show>
  );
};

const Thumbnail: Component<{ url: string }> = (props) => (
  <img
    class="attachment-thumb"
    src={props.url}
    alt="Attachment"
    onClick={() => openImage(props.url)}
  />
);

const MessageContent: Component<{ message: Message; chained: boolean }> = (
  props,
) => {
  const media = () => store[0].media;

  const attachment = () => {
    const name = props.message.attachment?.fileName;
    if (!name) return null;
    const blob = media().get(name);
    return { name, blob };
  };

  // Block-level previews for any rich URLs found in the text.
  const previews = () => {
    const parts = tokenize(props.message.message);
    return parts
      .filter((p): p is { type: "link"; url: string } => p.type === "link")
      .map((p) => {
        const id = youTubeId(p.url);
        if (id) return { kind: "youtube" as const, key: p.url, id };
        if (isImageUrl(p.url))
          return { kind: "image" as const, key: p.url, url: p.url };
        return null;
      })
      .filter((p) => p !== null);
  };

  return (
    <div class="message-content" classList={{ follow: props.chained }}>
      <Show
        when={attachment()}
        fallback={
          <p class="message">
            <For each={tokenize(props.message.message)}>
              {(part) =>
                part.type === "link" ? (
                  <a href={part.url} target="_blank" rel="noopener noreferrer">
                    {part.url}
                  </a>
                ) : (
                  <span>{part.value}</span>
                )
              }
            </For>
          </p>
        }
      >
        {(att) => (
          <Show
            when={att().blob}
            fallback={
              <p class="message attachment-missing">📎 {att().name}</p>
            }
          >
            {(blob) =>
              isImageName(att().name) ? (
                <Thumbnail url={objectUrlFor(blob())} />
              ) : isVideoName(att().name) ? (
                <video class="attachment-video" src={objectUrlFor(blob())} controls preload="metadata" />
              ) : (
                <a
                  class="message attachment-file"
                  href={objectUrlFor(blob())}
                  download={att().name}
                >
                  📎 {att().name}
                </a>
              )
            }
          </Show>
        )}
      </Show>

      <For each={previews()}>
        {(p) =>
          p.kind === "youtube" ? (
            <YouTubeEmbed id={p.id} />
          ) : (
            <Thumbnail url={p.url} />
          )
        }
      </For>
    </div>
  );
};

export default MessageContent;
