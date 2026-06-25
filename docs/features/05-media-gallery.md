# Media gallery tab

## Goal
A grid of all **images + video + audio** attachments in the loaded chat, sorted
chronologically. Per the confirmed decision: Media = images + video + audio.

## Depends on
- Doc 04 (tabs container + `attachmentNameFor` / `attachmentItems` shared helpers).

## Approach
New file `src/components/MediaGallery.tsx`:

1. **Items:** start from `attachmentItems()` (doc 04) and keep media types:
   ```ts
   const items = () =>
     attachmentItems().filter(
       ({ name }) => isImageName(name) || isVideoName(name) || isAudioName(name),
     );
   ```
   (`isImageName` / `isVideoName` / `isAudioName` from
   [src/utils/media.ts](../../src/utils/media.ts).)

2. **Render a responsive grid** (`.media-gallery` → CSS grid, ~3–5 cols desktop,
   2 mobile). Per item, by type:
   - **Image:** thumbnail `<img src={objectUrlFor(blob)}>`, clickable →
     `openImage(objectUrlFor(blob))` (reuse
     [ImageModal](../../src/components/ImageModal.tsx)).
   - **Video:** `<video src controls preload="metadata">` capped to the tile size.
   - **Audio:** compact row with the 🎤 icon (match existing MessageContent audio
     styling) + `<audio controls>`.

3. **Date label:** show `message.date` (locale string) under each tile.

4. **Jump back to chat:** a small "go to message" affordance on each tile calls
   the `onJump?(index)` prop wired to Viewer's `jumpToMessage` (doc 04). The index
   is the message's position in `store[0].messages` — compute it once when
   building items (carry `index` alongside `message`), don't `indexOf` per click.

5. **Empty state:** when `items().length === 0`, render "No media in this chat"
   (covers TXT-only imports and media-less chats).

## Files to touch / create
- `src/components/MediaGallery.tsx` (new).
- `src/styles/whatsapp.scss` — `.media-gallery` grid + tile styles.
- (consumes `attachmentItems`, `objectUrlFor`, `openImage`, `is*Name`).

## Notes
- `objectUrlFor` caches one URL per Blob, so reusing the same blob in a tile and
  in the chat bubble is free; `revokeAllObjectUrls` on chat switch already cleans up.
- Lazy-load images/videos (`loading="lazy"` on `<img>`, `preload="metadata"` on
  video) so large galleries don't fetch everything at once.

## Verification
- Load a ZIP with photos/videos/voice notes → Media tab shows them in a grid,
  newest-or-oldest consistent order; clicking an image opens the modal; video and
  audio play inline; "go to message" jumps to the Chat tab at that message.
