import { type Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { FaSolidChevronDown } from 'solid-icons/fa';
import type { Message } from 'whatsapp-chat-parser';
import ImageModal from '../components/ImageModal';
import MessageContent from '../components/MessageContent';
import TextChatModal from '../components/TextChatModal';
import store from '../store';

const Viewer: Component = () => {
  const [shownMessages, setShownMessages] = createSignal([] as Message[]);
  const [participants, setParticipants] = createSignal([] as string[]);
  const [active, setActive] = createSignal('');
  const [query, setQuery] = createSignal('');
  const [searchTerm, setSearchTerm] = createSignal('');
  const [activeHit, setActiveHit] = createSignal(-1);
  const [atBottom, setAtBottom] = createSignal(true);
  const messages = store[0].messages;
  let count = 0;
  let date = '';
  let searchDebounce: ReturnType<typeof setTimeout> | undefined;

  const displayMessages = (num = -1) => {
    if (num === -1) {
      count += 30;
    } else {
      count = num;
    }

    if (count > messages.length) {
      count = messages.length;
    }
    setShownMessages(messages.slice(0, count));
  };

  const handleParticipants = () => {
    let tempParticipants = [] as string[];
    messages.map((message) => {
      if (message.author && message.author !== 'System' && !tempParticipants.includes(message.author)) {
        tempParticipants.push(message.author);
      }
    });
    setParticipants(tempParticipants);
  };

  // Check if last message was also made by the same author
  const isChained = (index: number) => {
    const last = index - 1;
    return (
      last >= 0 &&
      shownMessages()[index].author === shownMessages()[last].author
    );
  };

  // Check if the author is the active user (the one writing)
  const isPrimary = (author: string | null) => {
    return author === active();
  };

  const parseDate = (date: Date) => {
    const userLang = navigator.language;
    return date.toLocaleString(userLang, {
      hour: 'numeric',
      minute: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const viewAll = () => {
    setShownMessages(messages);
  };

  const enableScroll = () => {
    window.onscroll = () => {
      const bottomOfWindow =
        window.scrollY + window.innerHeight >=
        document.body.offsetHeight - 1000;
      setAtBottom(
        window.scrollY + window.innerHeight >=
          document.body.offsetHeight - 50,
      );
      if (bottomOfWindow) {
        displayMessages();
      }
    };
  };

  const scrollToBottom = () => {
    viewAll();
    requestAnimationFrame(() => scrollToMessage(messages.length - 1));
  };

  const scrollToMessage = (index: number) => {
    const msg = document.getElementById(`message${index}`);
    if (msg) {
      console.log(`Scrolling to message ${index}`);
      msg.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      console.error(`Message ${index} does not exist`);
    }
  };

  const searchByDate = () => {
    const messageIndex = messages.findIndex((message) => {
      return message.date.toDateString() === new Date(date).toDateString();
    });
    if (messageIndex !== -1) {
      if (!document.getElementById(`message${messageIndex}`)) {
        // Render all messages until reaching the message found + 30
        displayMessages(messageIndex + 30);
      }
      scrollToMessage(messageIndex);
    } else {
      alert('No message found');
    }
  };

  const hits = () => {
    const q = searchTerm().toLowerCase();
    if (!q) return [] as number[];
    const result: number[] = [];
    messages.forEach((message, i) => {
      if (message.message?.toLowerCase().includes(q)) result.push(i);
    });
    return result;
  };

  const onQueryInput = (value: string) => {
    setQuery(value);
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      setSearchTerm(value.trim());
      setActiveHit(-1);
    }, 150);
  };

  const goToHit = (n: number) => {
    const list = hits();
    if (!list.length) return;
    const i = (n + list.length) % list.length;
    setActiveHit(i);
    const idx = list[i];
    if (!document.getElementById(`message${idx}`)) displayMessages(idx + 30);
    scrollToMessage(idx);
  };

  const matchLabel = () => {
    const list = hits();
    if (!searchTerm()) return '';
    if (!list.length) return 'No matches';
    return `${activeHit() + 1} / ${list.length}`;
  };

  onMount(() => {
    displayMessages();
    enableScroll();
  });

  onCleanup(() => {
    window.onscroll = null;
    if (searchDebounce) clearTimeout(searchDebounce);
  });

  // Set participants, defaulting active to "Pablete" when present, else the first one
  handleParticipants();
  setActive(
    participants().includes('Pablete') ? 'Pablete' : participants()[0],
  );

  return (
    <section id='wrapper' class='section'>
      <ImageModal />
      <TextChatModal />
      <div class="box">
        <div class='columns is-centered is-vcentered is-multiline'>
          <div class='column is-narrow'>
            <div class='field has-addons'>
              <div class='control'>
                <input
                  onChange={(e) => (date = e.target.value)}
                  value={date}
                  class='input'
                  type='date'
                />
              </div>
              <div class='control'>
                <button onClick={searchByDate} class='button is-info'>
                  Search
                </button>
              </div>
            </div>
          </div>
          <div class='column is-narrow'>
            <div class='field has-addons'>
              <div class='control'>
                <input
                  onInput={(e) => onQueryInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') goToHit(activeHit() + 1);
                  }}
                  value={query()}
                  class='input'
                  type='text'
                  placeholder='Search in chat'
                />
              </div>
              <div class='control'>
                <button
                  onClick={() => goToHit(activeHit() - 1)}
                  class='button'
                  disabled={!hits().length}
                  title='Previous match'
                >
                  ‹
                </button>
              </div>
              <div class='control'>
                <button
                  onClick={() => goToHit(activeHit() + 1)}
                  class='button'
                  disabled={!hits().length}
                  title='Next match'
                >
                  ›
                </button>
              </div>
              <Show when={searchTerm()}>
                <div class='control'>
                  <span class='button is-static'>{matchLabel()}</span>
                </div>
              </Show>
            </div>
          </div>
          <div class='column is-narrow'>
            <div class='field'>
              <label class='label'>Active participant</label>
              <div class='control'>
                <div class='select'>
                  <select onChange={(e) => setActive(e.target.value)}>
                    <For each={participants()}>
                      {(participant) => (
                        <option
                          value={participant}
                          selected={active() === participant}
                        >
                          {participant}
                        </option>
                      )}
                    </For>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class='column is-narrow'>
            <div class='buttons'>
              <button onClick={viewAll} class='button is-danger'>
                Show all messages
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div id='wa-container' class='wa-container'>
        <For each={shownMessages()}>
          {(message, i) => (
            <div id={'message' + i()} class='msg'>
              <div
                class='bubble'
                classList={{
                  alt: isPrimary(message.author) && !isChained(i()),
                  follow: isChained(i()) && !isPrimary(message.author),
                  altfollow: isPrimary(message.author) && isChained(i()),
                }}
              >
                <div class='txt'>
                  {!isChained(i()) && <p class='name'>{message.author}</p>}
                  <MessageContent message={message} chained={isChained(i())} highlight={searchTerm()} />
                  <span class='timestamp'>{parseDate(message.date)}</span>
                </div>
                {!isChained(i()) && (
                  <div
                    class='bubble-arrow'
                    classList={{ alt: isPrimary(message.author) }}
                  ></div>
                )}
              </div>
            </div>
          )}
        </For>
      </div>
      <Show when={!atBottom()}>
        <button
          onClick={scrollToBottom}
          class='scroll-bottom-btn'
          title='Scroll to bottom'
        >
          <FaSolidChevronDown />
        </button>
      </Show>
    </section>
  );
};

export default Viewer;
