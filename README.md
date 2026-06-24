# WhatsApp Export Viewer

Pretty-print a WhatsApp chat export in your browser — entirely client-side, nothing is ever uploaded.

## Features

- Load a raw `.txt` export, or a `.zip` export straight from WhatsApp (unzipped in-memory)
- Inline rendering of attached photos and videos, with a click-to-expand photo viewer
- Clickable links, with rich inline previews for direct image links and YouTube
- Jump to any date, or filter messages by participant
- Infinite scroll through long chat histories

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
