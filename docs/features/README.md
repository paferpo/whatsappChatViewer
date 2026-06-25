# Feature roadmap

Planned features for the WhatsApp Export Viewer (SolidJS + Vite + Tauri v2).
One spec per topic; implement in roughly this order — the shared
`attachmentNameFor` refactor in doc 04 unblocks the galleries (05, 06).

| # | Topic | Spec | Status |
|---|-------|------|--------|
| 1 | Search in Chat | [01-search-in-chat.md](01-search-in-chat.md) | planned |
| 2 | Recent files history (delete) | [02-recent-files-history.md](02-recent-files-history.md) | done — polish only |
| 3 | Scroll-to-bottom button | [03-scroll-to-bottom.md](03-scroll-to-bottom.md) | planned |
| 4 | Chat / Media / Docs tabs (+ shared refactor) | [04-tabs-layout.md](04-tabs-layout.md) | done |
| 5 | Media gallery tab | [05-media-gallery.md](05-media-gallery.md) | done |
| 6 | Docs gallery tab | [06-docs-gallery.md](06-docs-gallery.md) | done |
| 7 | CI/CD releases (macOS + Windows) | [07-ci-cd-releases.md](07-ci-cd-releases.md) | done |

## Decisions
- **Recent-files delete:** already implemented; only minor polish.
- **CI/CD signing:** unsigned releases first (tauri-action → GitHub Releases).
- **Media/Docs split:** Media = images + video + audio; Docs = everything else.

## Key shared facts
- State: `src/store.ts` → `{ messages: Message[], media: Map<string, Blob> }`.
  `media` is populated **only for ZIP imports** — galleries are empty for TXT-only chats.
- Reusable helpers in `src/utils/media.ts`: `objectUrlFor`, `isImageName`,
  `isVideoName`, `isAudioName`, `isTextName` (+ new `attachmentNameFor`).
- Viewer reuse points: `displayMessages`, `viewAll`, `scrollToMessage`.
