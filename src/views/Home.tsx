import { useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { FaSolidSpinner, FaSolidUpload } from "solid-icons/fa";
import { type Component, createSignal, For, Show } from "solid-js";
import { parseString } from "whatsapp-chat-parser";
import store from "../store";
import { revokeAllObjectUrls } from "../utils/media";
import { addRecentChat, getRecentChats, removeRecentChat } from "../utils/recentChats";
import { extractChatZip } from "../utils/zip";

const basename = (path: string): string => path.split(/[\\/]/).pop() ?? path;

const Home: Component = () => {
  const navigate = useNavigate();
  const [parsing, setParsing] = createSignal(false);
  const [error, setError] = createSignal("");
  const [recent, setRecent] = createSignal(getRecentChats());
  const setState = store[1];

  const loadChatFromPath = async (path: string, name: string) => {
    setParsing(true);
    setError("");

    try {
      revokeAllObjectUrls();
      await invoke("allow_recent_file_access", { path });

      let bytes: Uint8Array;
      try {
        bytes = await readFile(path);
      } catch {
        setRecent(removeRecentChat(path));
        throw new Error("This file could no longer be found.");
      }

      const isZip = name.toLowerCase().endsWith(".zip");
      let text: string;
      let media = new Map<string, Blob>();

      if (isZip) {
        const extracted = await extractChatZip(bytes);
        text = extracted.text;
        media = extracted.media;
      } else {
        text = new TextDecoder("utf-8").decode(bytes);
      }

      const messages = parseString(text, { parseAttachments: true });
      setState({ messages, media });
      setRecent(addRecentChat(path, name));
      navigate("/viewer");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Could not read the selected file.",
      );
    } finally {
      setParsing(false);
    }
  };

  const handlePickFile = async () => {
    const path = await open({
      multiple: false,
      filters: [{ name: "WhatsApp export", extensions: ["txt", "zip"] }],
    });
    if (!path) return;
    await loadChatFromPath(path, basename(path));
  };

  return (
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container has-text-centered">
          <p class="title">Whatsapp Export Viewer</p>
          <div class="field is-flex is-justify-content-center">
            <div class="control">
              <div class="file is-boxed">
                <button
                  type="button"
                  class="file-cta"
                  disabled={parsing()}
                  onClick={handlePickFile}
                >
                  <span class="file-icon">
                    <FaSolidUpload />
                  </span>
                  <span class="file-label">
                    <Show
                      when={parsing()}
                      fallback={"Select WhatsApp export (TXT or ZIP)"}
                    >
                      <span class="icon-text">
                        <span class="icon">
                          <FaSolidSpinner />
                        </span>
                        <span>Loading...</span>
                      </span>
                    </Show>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <Show when={error()}>
            <p class="help is-danger">{error()}</p>
          </Show>
          <Show when={recent().length > 0}>
            <nav class="panel recent-chats-panel">
              <p class="panel-heading">Recent chats</p>
              <For each={recent()}>
                {(chat) => (
                  <div class="panel-block is-justify-content-space-between">
                    <button
                      type="button"
                      class="button is-white recent-chat-button"
                      disabled={parsing()}
                      onClick={() => loadChatFromPath(chat.path, chat.name)}
                    >
                      <span class="recent-chat-text">
                        <span class="has-text-weight-medium recent-chat-line">
                          {chat.name}
                        </span>
                        <span class="is-size-7 has-text-grey recent-chat-line">
                          {chat.path}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Remove from recent chats"
                      class="delete is-small ml-2"
                      onClick={() => setRecent(removeRecentChat(chat.path))}
                    />
                  </div>
                )}
              </For>
            </nav>
          </Show>
        </div>
      </div>
    </section>
  );
};

export default Home;
