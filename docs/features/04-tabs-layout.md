# Chat / Media / Docs tabs

## Goal
Add a three-tab layout to the Viewer: **Chat** (current message view), **Media**
(gallery, doc 05), **Docs** (file list, doc 06). This doc covers the tab
container and the shared refactor both galleries depend on.

## Shared refactor (do this FIRST — unblocks 05 & 06)
Attachment-name resolution currently lives inside
[MessageContent.tsx:118-125](../../src/components/MessageContent.tsx#L118-L125):

```ts
const ATTACHMENT_TAG_RE = /<[^<>:]+:\s*([^<>]+)>\s*$/;   // line 13
const name =
  props.message.attachment?.fileName ??
  props.message.message.match(ATTACHMENT_TAG_RE)?.[1]?.trim();
```

Extract a pure helper into [src/utils/media.ts](../../src/utils/media.ts):

```ts
import type { Message } from "whatsapp-chat-parser";

const ATTACHMENT_TAG_RE = /<[^<>:]+:\s*([^<>]+)>\s*$/;

/** Resolved attachment filename for a message, or null if none. */
export const attachmentNameFor = (message: Message): string | null =>
  message.attachment?.fileName ??
  message.message.match(ATTACHMENT_TAG_RE)?.[1]?.trim() ??
  null;
```

Then in MessageContent, replace the inline logic with
`const name = attachmentNameFor(props.message)` and drop the local
`ATTACHMENT_TAG_RE`. Behavior is unchanged.

### Shared selector for the galleries
Add a small helper (in MediaGallery/DocsGallery or a tiny `utils/attachments.ts`)
that both galleries reuse:

```ts
import store from "../store";
import { attachmentNameFor } from "../utils/media";

export interface MediaItem { name: string; blob: Blob; message: Message; }

export const attachmentItems = (): MediaItem[] =>
  store[0].messages
    .map((message) => {
      const name = attachmentNameFor(message);
      const blob = name ? store[0].media.get(name) : undefined;
      return name && blob ? { name, blob, message } : null;
    })
    .filter((x): x is MediaItem => x !== null)
    .sort((a, b) => a.message.date.getTime() - b.message.date.getTime());
```

`media` is only populated for ZIP imports, so this is empty for TXT-only chats —
each gallery renders an empty state in that case.

## Tab container
In [Viewer.tsx](../../src/views/Viewer.tsx):

1. `const [activeTab, setActiveTab] = createSignal<'chat' | 'media' | 'docs'>('chat')`.
2. Render Bulma tabs (`<div class="tabs"><ul>…</ul></div>`) in the controls `.box`,
   each `<li classList={{ 'is-active': activeTab() === '…' }}>` with an
   `onClick={() => setActiveTab('…')}`.
3. Body:
   ```tsx
   <Show when={activeTab() === 'chat'}>{/* existing wa-container + For */}</Show>
   <Show when={activeTab() === 'media'}><MediaGallery onJump={jumpToMessage} /></Show>
   <Show when={activeTab() === 'docs'}><DocsGallery /></Show>
   ```
4. The date/text search controls and the scroll-to-bottom button (doc 03) are
   Chat-only — gate them on `activeTab() === 'chat'`.
5. `jumpToMessage(index)` helper: `setActiveTab('chat')`, render up to the index
   (`displayMessages(index + 30)` if needed), then `scrollToMessage(index)` — lets
   a gallery tile jump back into the conversation.

## Files to touch / create
- `src/utils/media.ts` — add `attachmentNameFor` (+ optional `isDocumentName`, see 06).
- `src/components/MessageContent.tsx` — use `attachmentNameFor`.
- `src/views/Viewer.tsx` — `activeTab`, tabs UI, conditional bodies, `jumpToMessage`.
- `src/components/MediaGallery.tsx` (new — doc 05), `src/components/DocsGallery.tsx` (new — doc 06).
- `src/styles/whatsapp.scss` — tab spacing tweaks if needed.

## Verification
- Load a ZIP chat → three tabs render; switching shows Chat / Media / Docs.
- TXT-only chat → Media and Docs show a "No attachments" empty state; Chat works.
- MessageContent still renders attachments correctly after the refactor (regression).
