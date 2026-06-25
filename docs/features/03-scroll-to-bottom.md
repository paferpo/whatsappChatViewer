# Scroll-to-bottom button

## Goal
A floating button that jumps to the newest message, shown only when the user has
scrolled away from the bottom.

## Current state
- [Viewer.tsx](../../src/views/Viewer.tsx) renders `messages.slice(0, count)`
  **oldest→newest**; infinite scroll (`enableScroll`) loads 30 more as the user
  nears the bottom (toward newer messages). So the newest message is the **last**
  item and "bottom" = the end of the full list.
- Helpers already present: `viewAll()` (renders all messages), `scrollToMessage(index)`
  (smooth `scrollIntoView`), and the `window.onscroll` handler with the
  `bottomOfWindow` threshold math.

## Approach
In [Viewer.tsx](../../src/views/Viewer.tsx):

1. **State:** `const [atBottom, setAtBottom] = createSignal(true)`.

2. **Track position** inside the existing `enableScroll()` handler — reuse the
   `bottomOfWindow` calculation already there, and also update the signal:
   ```ts
   window.onscroll = () => {
     const nearBottom =
       window.scrollY + window.innerHeight >= document.body.offsetHeight - 1000;
     setAtBottom(window.scrollY + window.innerHeight >= document.body.offsetHeight - 50);
     if (nearBottom) displayMessages();
   };
   ```
   (Keep the existing `-1000` trigger for loading; use a tighter `-50` for the
   button's visibility.)

3. **Handler:** render everything, then scroll to the last message:
   ```ts
   const scrollToBottom = () => {
     viewAll();
     // wait a tick for the DOM to render the full list
     requestAnimationFrame(() => scrollToMessage(messages.length - 1));
   };
   ```

4. **UI:** a fixed circular icon button (solid-icons chevron-down, e.g.
   `FaSolidChevronDown` from `solid-icons/fa`), rendered with
   `<Show when={!atBottom()}>`, placed near the bottom-right of the viewport.

## Files to touch
- `src/views/Viewer.tsx` — `atBottom` signal, scroll handler update, button.
- `src/styles/whatsapp.scss` — `.scroll-bottom-btn` (`position: fixed; right; bottom;
  border-radius: 50%; z-index` above content; respects mobile safe area).

## Reuse
- `viewAll`, `scrollToMessage`, existing `window.onscroll` handler.

## Notes
- `viewAll()` on huge chats renders the whole list — same cost as the existing
  "Show all messages" button, so acceptable. If perf matters later, swap for an
  incremental load-to-end, but keep it simple now.
- When the Media/Docs tabs land (doc 04), only show this button on the Chat tab.

## Verification
- Scroll up in a long chat → button appears. Click → list fills and view lands on
  the newest message; button hides once at the bottom.
