```
  ____  _           _   __  __ _                 _
 / ___|| |__   __ _| |_|  \/  (_) __ _ _ __ __ _| |_ ___
| |    | '_ \ / _` | __| |\/| | |/ _` | '__/ _` | __/ _ \
| |___ | | | | (_| | |_| |  | | | (_| | | | (_| | ||  __/
 \____||_| |_|\__,_|\__|_|  |_|_|\__, |_|  \__,_|\__\___|
                                  |___/
```

# ChatMigrate

**Move your AI conversations between ChatGPT and Claude — no server required.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-chat--migrate.vercel.app-black?logo=vercel)](https://chat-migrate.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Made with React](https://img.shields.io/badge/Made%20with-React%2018-61dafb?logo=react)](https://react.dev)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646cff?logo=vite)](https://vitejs.dev)

**[Try it live → chat-migrate.vercel.app](https://chat-migrate.vercel.app)**

---

## What it does

ChatMigrate is a fully client-side web app that reads your exported chat history from ChatGPT or Claude and helps you migrate it to another platform or format. Everything runs in your browser — no backend, no server, no data ever leaves your machine except to the AI provider's own API.

---

## Features

- **Upload ChatGPT or Claude export files** — drop in the `conversations.json` file from your data export and load all your chats instantly
- **Browse and select chats to migrate** — search, filter, and pick exactly which conversations you want to move
- **Multiple migration targets** — send to Claude via API, or export to JSON or Markdown files
- **Live progress log** — watch each chat migrate in real time with a progress bar and color-coded log entries
- **Dark / Light mode** — defaults to dark after 6 PM and light during the day, switchable at any time
- **All processing in-browser** — zero backend, zero server roundtrips for your data
- **API keys never stored to disk** — keys live in memory only (sessionStorage at most) and are gone when you close the tab

---

## How to get your export file

### ChatGPT (OpenAI)

1. Log in at [chat.openai.com](https://chat.openai.com)
2. Click your profile icon (bottom-left) → **Settings**
3. Go to **Data Controls**
4. Click **Export Data** → confirm the export request
5. Wait up to 24 hours — OpenAI will email you a download link
6. Download the ZIP file and unzip it
7. Open ChatMigrate and upload the `conversations.json` file from the unzipped folder

### Claude (Anthropic)

1. Log in at [claude.ai](https://claude.ai)
2. Click your profile icon → **Settings**
3. Go to **Privacy**
4. Click **Export Data** → confirm the export request
5. You will receive an email with a download link (usually within a few minutes)
6. Download the ZIP file and unzip it
7. Open ChatMigrate and upload the `conversations.json` file from the unzipped folder

---

## Getting Started

### End users

Visit the hosted version at:

```
https://chatmigrate.app
```

**[Open the app → https://chat-migrate.vercel.app](https://chat-migrate.vercel.app)**

No installation required. Your browser does everything.

### Run locally

If you prefer to run it yourself:

```bash
git clone https://github.com/maniwebertech/chat-migrate.git
cd chat-migrate
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Local Development

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/chat-migrate.git
cd chat-migrate

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. It is a fully static site — serve it from any static host (Netlify, Vercel, GitHub Pages, S3, etc.).

---

## Project Structure

```
chat-migrate/
├── index.html
├── vite.config.js          # Vite config + optional CORS proxy
├── tailwind.config.js
├── package.json
├── CLAUDE.md               # AI assistant guide for this project
├── CONTRIBUTING.md
├── LICENSE
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AppContext.jsx  # Global state: keys, chats, step, log
    ├── components/
    │   ├── StepBar.jsx        # Top progress steps UI
    │   ├── ApiKeySetup.jsx    # Step 1: configure providers + API keys
    │   ├── ChatList.jsx       # Step 2: browse + select chats
    │   ├── MigrationPanel.jsx # Step 3: run migration + live log
    │   └── DoneScreen.jsx     # Step 4: summary + export report
    └── services/
        ├── openai.js       # ChatGPT API helpers
        ├── anthropic.js    # Claude API helpers
        └── migrator.js     # Core migration orchestrator
```

---

## Known Limitations

| Limitation | Detail |
|---|---|
| No ChatGPT import API | OpenAI does not offer a public API to create conversations. ChatGPT is source-only in the current version. |
| Claude as target via API only | The Claude API supports creating messages but not importing full conversation history natively. Migrated chats are sent as new Claude conversations. |
| CORS in the browser | Direct browser calls to the OpenAI and Anthropic APIs require either the Vite dev proxy (included) or a thin server proxy for production. |
| Rate limits | The migrator adds a small delay between requests to avoid hitting provider rate limits, but large exports may take time. |
| Large chats | Conversations with more than 100 messages are automatically chunked before being sent to the target API. |

---

## Roadmap

- [ ] Backend proxy for production deployments (Node/Express)
- [ ] Claude to Claude migration (different projects or accounts)
- [ ] Gemini and Grok as migration targets
- [ ] Electron desktop app (no CORS issues, no hosting needed)
- [ ] Bulk export to Markdown files (one file per conversation)
- [ ] Conversation tagging and filtering before migration
- [ ] Resume interrupted migrations

---

## Testing

### Try it immediately — no real export needed

Two sample files are included so you can test the full flow right away:

| File | Simulates | Chats |
|---|---|---|
| [`sample_conversations.json`](./sample_conversations.json) | ChatGPT export | Python Sorting Help, React useEffect Question |
| [`sample_claude_conversations.json`](./sample_claude_conversations.json) | Claude.ai export | JavaScript Async/Await, CSS Grid vs Flexbox, Git Rebase vs Merge |

Upload either file in the app to test the complete migration flow without waiting for your real export.

**→ Full testing walkthrough: [TESTING.md](./TESTING.md)**

### Automated tests

```bash
npm test              # Vitest unit tests (14 tests, ~3s)
npm run test:e2e      # Playwright E2E tests (Chromium + Firefox)
npm run test:ui       # Vitest with visual UI
npm run test:e2e:ui   # Playwright with interactive browser UI
```

---

## Contributing

Contributions are very welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on reporting bugs, requesting features, and submitting pull requests.

---

## Privacy and Security

ChatMigrate is designed with privacy as a first principle:

- **API keys are never stored to disk.** They live in memory (or sessionStorage at most) and are cleared when you close the browser tab.
- **Your chat data never passes through any third-party server.** When you migrate to Claude, your data goes directly from your browser to `api.anthropic.com`. Same for OpenAI.
- **No analytics, no tracking, no telemetry** of any kind is included in this project.
- **Fully open source.** Every line of code is here for you to read and audit.

If you find a security issue, please open a private GitHub Security Advisory rather than a public issue.

---

## License

[MIT](./LICENSE) — Copyright (c) 2025 ChatMigrate Contributors

---

## Acknowledgements

- [OpenAI](https://openai.com) for the ChatGPT API and data export feature
- [Anthropic](https://anthropic.com) for the Claude API and data export feature
- [Vite](https://vitejs.dev) and [React](https://react.dev) for the excellent developer experience
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling system
