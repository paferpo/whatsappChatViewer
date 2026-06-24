import { useNavigate } from "@solidjs/router";
import { FaSolidSpinner, FaSolidUpload } from "solid-icons/fa";
import { type Component, createSignal, Show } from "solid-js";
import { parseString } from "whatsapp-chat-parser";
import store from "../store";
import { revokeAllObjectUrls } from "../utils/media";
import { extractChatZip } from "../utils/zip";

const Home: Component = () => {
  const navigate = useNavigate();
  const [parsing, setParsing] = createSignal(false);
  const [error, setError] = createSignal("");
  const setState = store[1];

  const handleNewFile = async (input: EventTarget & HTMLInputElement) => {
    if (!input.files || input.files.length !== 1) return;

    const file = input.files[0];
    setParsing(true);
    setError("");

    try {
      // Release object URLs from any previously loaded chat.
      revokeAllObjectUrls();

      const isZip =
        file.name.toLowerCase().endsWith(".zip") ||
        file.type === "application/zip" ||
        file.type === "application/x-zip-compressed";

      let text: string;
      let media = new Map<string, Blob>();

      if (isZip) {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const extracted = await extractChatZip(buffer);
        text = extracted.text;
        media = extracted.media;
      } else {
        text = await file.text();
      }

      const messages = parseString(text, { parseAttachments: true });
      setState({ messages, media });
      navigate("/viewer");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Could not read the selected file.",
      );
    } finally {
      setParsing(false);
      // Allow re-selecting the same file to trigger onChange again.
      input.value = "";
    }
  };

  return (
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container">
          <p class="title">Whatsapp Export Viewer</p>
          <div class="field">
            <div class="control">
              <div class="file is-boxed">
                <label class="file-label">
                  <input
                    class="file-input"
                    type="file"
                    accept=".txt,.zip,text/plain,application/zip"
                    onChange={(e) => handleNewFile(e.target)}
                  />
                  <span class="file-cta">
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
                  </span>
                </label>
              </div>
            </div>
          </div>
          <Show when={error()}>
            <p class="help is-danger">{error()}</p>
          </Show>
        </div>
      </div>
    </section>
  );
};

export default Home;
