# Docs gallery tab

## Goal
A list of all **non-media** attachments (pdf, doc/docx, xls/xlsx, ppt, zip, and
any other file) with date, size, and a download link. Per the confirmed split:
Docs = everything that isn't image/video/audio.

## Depends on
- Doc 04 (tabs container + `attachmentNameFor` / `attachmentItems` helpers).

## Approach
New file `src/components/DocsGallery.tsx`:

1. **Items:** from `attachmentItems()` (doc 04), keep everything that is **not**
   image/video/audio:
   ```ts
   const items = () =>
     attachmentItems().filter(
       ({ name }) => !isImageName(name) && !isVideoName(name) && !isAudioName(name),
     );
   ```
   `.txt` files pass this filter and stay here (they're documents), but keep their
   special behavior — see step 3.

2. **Optional helper** in [src/utils/media.ts](../../src/utils/media.ts) for a
   nicer label / icon (not required for the filter):
   ```ts
   const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|csv|zip|rtf|odt)$/i;
   export const isDocumentName = (name: string): boolean => DOC_EXT.test(name);
   ```

3. **Render rows** (`.docs-list`): file icon (📎, or type-specific later),
   filename, `message.date`, human-readable size from `blob.size`, and an action:
   - **`.txt` chat exports:** a button that opens the existing TextChatModal —
     `openTextChat(name, parseString(await blob.text(), { parseAttachments: true }))`
     with the raw-text fallback, mirroring `openNestedTextChat` in
     [MessageContent.tsx:15-27](../../src/components/MessageContent.tsx#L15-L27).
     Consider exporting that helper from MessageContent (or a shared util) to avoid
     duplicating the parse-or-fallback logic.
   - **All other files:** a download link
     `<a href={objectUrlFor(blob)} download={name}>Download</a>`.

4. **Jump back to chat:** same `onJump?(index)` prop pattern as the media gallery
   (doc 04/05).

5. **Empty state:** "No documents in this chat" when `items().length === 0`.

## Files to touch / create
- `src/components/DocsGallery.tsx` (new).
- `src/utils/media.ts` — optional `isDocumentName` (for labels/icons only).
- `src/styles/whatsapp.scss` — `.docs-list` row styling.
- (Optional) export `openNestedTextChat` from MessageContent for reuse.

## Notes
- Size helper: a tiny `formatBytes(n)` (B/KB/MB) — keep it local unless reused.
- Downloads use object URLs (already cached + revoked on chat switch). In the
  Tauri webview this triggers a normal browser download.

## Verification
- Load a ZIP containing a PDF and a forwarded `.txt` chat → Docs tab lists both;
  PDF "Download" saves the file; the `.txt` opens in the TextChatModal; image/
  video/audio do **not** appear here (they're in Media).
