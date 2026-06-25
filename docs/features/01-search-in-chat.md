# Search in Chat

## Goal
Free-text search across the currently loaded chat. Today only **date** search
exists (`searchByDate` in [Viewer.tsx](../../src/views/Viewer.tsx)); this adds a
text query that finds matching messages, lets the user jump between hits, and
highlights the matched text.

## Current state
- `src/views/Viewer.tsx` holds the full list in `messages = store[0].messages`
  and renders `messages.slice(0, count)` with infinite scroll (`displayMessages`).
- `searchByDate()` already demonstrates the jump pattern: render up to a target
  index, then `scrollToMessage(index)`.
- Message text lives on `message.message` (string). `message.author` / `message.date`
  give sender + timestamp.

## Approach
In [Viewer.tsx](../../src/views/Viewer.tsx):

1. **State**
   - `const [query, setQuery] = createSignal('')`
   - `const [activeHit, setActiveHit] = createSignal(0)` (index into the hit list)
   - `const hits = () => { const q = query().trim().toLowerCase(); return q ? messages.reduce((acc, m, i) => { if (m.message?.toLowerCase().includes(q)) acc.push(i); return acc; }, [] as number[]) : []; }`

2. **UI** — add a text input next to the existing date search box (same `.box`
   controls row). Show a small results summary (`N matches`) and prev/next
   buttons. Optionally a dropdown list of hits (sender · short date · snippet).

3. **Jump to a hit** — reuse the `searchByDate` pattern:
   ```ts
   const goToHit = (n: number) => {
     const list = hits();
     if (!list.length) return;
     const i = (n + list.length) % list.length;   // wrap
     setActiveHit(i);
     const idx = list[i];
     if (!document.getElementById(`message${idx}`)) displayMessages(idx + 30);
     scrollToMessage(idx);
   };
   ```
   Enter / next button → `goToHit(activeHit() + 1)`, prev → `goToHit(activeHit() - 1)`.

4. **Highlight** — pass the active query down so matched text renders inside a
   `<mark>`. Add an optional `highlight?: string` prop to
   [MessageContent.tsx](../../src/components/MessageContent.tsx); in its plain-text
   token rendering, when `highlight` is set, split the text on the (case-insensitive)
   term and wrap matches in `<mark class="wa-highlight">`. Leave link/attachment
   tokenization untouched.

## Files to touch
- `src/views/Viewer.tsx` — query state, search input UI, `hits`, `goToHit`.
- `src/components/MessageContent.tsx` — optional `highlight` prop + `<mark>`.
- `src/styles/whatsapp.scss` — `.wa-highlight` + results-list styling.

## Reuse
- `displayMessages`, `scrollToMessage` (already in Viewer.tsx).

## Edge cases / notes
- Empty / whitespace query → no hits, hide results UI.
- Searching jumps within the same chat only (no cross-chat search).
- Large chats: `hits()` scans all messages on each keystroke — debounce the
  input (~150ms) if it feels laggy; the scan itself is O(n) string includes and
  fine for typical exports.
- Attachment-only messages have minimal `message` text; that's acceptable
  (search is text-oriented).

## Verification
- Load a chat, type a known word → match count updates, next/prev cycles through
  hits, the view scrolls to each, and the term is highlighted in the bubble.
- Clear the query → highlights and results UI disappear.
