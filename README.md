# WhatsApp Chat Viewer

Pretty-print a WhatsApp chat export in your browser — entirely client-side, nothing is ever uploaded.

## Features

- Load a raw `.txt` export, or a `.zip` export straight from WhatsApp (unzipped in-memory)
- Inline rendering of attached photos, videos, and voice notes, with a click-to-expand photo viewer
- Forwarded chat attachments (a `.txt` chat exported as a file inside another chat) open pretty-printed in their own modal
- Clickable links, with rich inline previews for direct image links and YouTube
- Chat / Media / Docs tabs to browse attachments separately from the conversation
- Search in chat, with match highlighting and next/previous navigation
- Jump to any date, or filter messages by participant
- Infinite scroll through long chat histories, with a scroll-to-bottom shortcut
- Recent chats history on the desktop app, with per-entry delete

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Preview the production build

```
npm run serve
```

## Usage

1. Export a chat from WhatsApp (`Chat > More > Export chat`, with or without media).
2. Open the app and select the exported `.txt` or `.zip` file.
3. Browse the chat — attachments referenced in the export render inline automatically.

## Tech stack

[SolidJS](https://www.solidjs.com/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/), styled with [Bulma](https://bulma.io/). Chat parsing via [whatsapp-chat-parser](https://github.com/Pustur/whatsapp-chat-parser), ZIP extraction via [fflate](https://github.com/101arrowz/fflate).

## Releases / building

The app is also packaged as a desktop app via [Tauri](https://tauri.app/).

- **Local build:** `npm run tauri:build` produces installers under
  `src-tauri/target/release/bundle/`.
- **Cutting a release:** see [docs/RELEASING.md](docs/RELEASING.md) for the
  full process (which files' versions to bump, tagging, watching the
  workflow). Short version: bump versions, `git tag vX.Y.Z`,
  `git push --tags` — this triggers
  [`.github/workflows/release.yml`](.github/workflows/release.yml), which
  builds macOS and Windows installers and attaches them to a **draft** GitHub
  Release — publish it manually after checking the artifacts.
- **Unsigned installs:** releases are currently unsigned.
  - **macOS:** right-click the app → Open (or run
    `xattr -dr com.apple.quarantine /path/to/WhatsappChatViewer.app`) the first time.
  - **Windows:** click "More info" → "Run anyway" past the SmartScreen warning.

## Credits

Based on [WA-Export-Viewer](https://codeberg.org/ferreiro/WA-Export-Viewer). This fork builds on that base.

Licensed under [AGPLv3](LICENSE), same as the original.
