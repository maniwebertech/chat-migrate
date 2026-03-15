# ChatMigrate — Project Guide
> AI Chat Migration Tool: Move conversations between ChatGPT and Claude
> Built with React + Vite | Step-by-step guide for VS Code

---

## WHAT WE'RE BUILDING

A web app that lets you:
1. Enter your OpenAI and Anthropic API keys
2. Load all your chats from ChatGPT or Claude
3. Select which chats to migrate
4. Move them to the other platform — with a live progress bar and log

---

## TECH STACK

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP | Native fetch (no axios) |
| State | useState / useContext (no Redux) |
| Storage | sessionStorage only (keys never saved to disk) |
| Backend | None for MVP — all client-side |

---

## FOLDER STRUCTURE

```
chat-migrate/
├── CLAUDE.md                  ← this file
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── context/
│   │   └── AppContext.jsx     ← global state (keys, chats, step)
│   ├── components/
│   │   ├── StepBar.jsx        ← top progress steps UI
│   │   ├── ApiKeySetup.jsx    ← Step 1: enter + validate API keys
│   │   ├── ChatList.jsx       ← Step 2: load + select chats
│   │   ├── MigrationPanel.jsx ← Step 3: run migration + live log
│   │   └── DoneScreen.jsx     ← Step 4: summary + export
│   └── services/
│       ├── openai.js          ← ChatGPT API functions
│       ├── anthropic.js       ← Claude API functions
│       └── migrator.js        ← core migration orchestrator
```

---

## STEP-BY-STEP BUILD GUIDE

---

### STEP 0 — Bootstrap the Project

Run in terminal:

```bash
npm create vite@latest chat-migrate -- --template react
cd chat-migrate
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then open VS Code:
```bash
code .
```

Paste this file as `CLAUDE.md` at root.

---

### STEP 1 — Configure Tailwind

**File: `tailwind.config.js`**
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**File: `src/index.css`** — replace everything with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### STEP 2 — Global State (AppContext)

**File: `src/context/AppContext.jsx`**

Holds:
- `step` — current screen: `setup | select | migrate | done`
- `apiKeys` — `{ openai: "", anthropic: "" }`
- `sourceProvider` — `"chatgpt"` or `"claude"`
- `targetProvider` — `"chatgpt"` or `"claude"`
- `chats` — array of loaded chat objects
- `selectedIds` — Set of selected chat IDs
- `migrationLog` — array of log entries

```jsx
import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [step, setStep] = useState("setup");
  const [apiKeys, setApiKeys] = useState({ openai: "", anthropic: "" });
  const [sourceProvider, setSourceProvider] = useState(null);
  const [targetProvider, setTargetProvider] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [migrationLog, setMigrationLog] = useState([]);

  const addLog = (msg, type = "info") => {
    setMigrationLog(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
  };

  return (
    <AppContext.Provider value={{
      step, setStep,
      apiKeys, setApiKeys,
      sourceProvider, setSourceProvider,
      targetProvider, setTargetProvider,
      chats, setChats,
      selectedIds, setSelectedIds,
      migrationLog, addLog,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
```

---

### STEP 3 — App Entry

**File: `src/main.jsx`**
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
  </AppProvider>
);
```

**File: `src/App.jsx`**
```jsx
import { useApp } from "./context/AppContext";
import StepBar from "./components/StepBar";
import ApiKeySetup from "./components/ApiKeySetup";
import ChatList from "./components/ChatList";
import MigrationPanel from "./components/MigrationPanel";
import DoneScreen from "./components/DoneScreen";

export default function App() {
  const { step } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      <StepBar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === "setup"   && <ApiKeySetup />}
        {step === "select"  && <ChatList />}
        {step === "migrate" && <MigrationPanel />}
        {step === "done"    && <DoneScreen />}
      </main>
    </div>
  );
}
```

---

### STEP 4 — StepBar Component

**File: `src/components/StepBar.jsx`**

4 steps shown at top: Configure → Select → Migrate → Done
Highlight current step in amber, completed in green.

---

### STEP 5 — ApiKeySetup Component

**File: `src/components/ApiKeySetup.jsx`**

UI:
- Two provider buttons: ChatGPT | Claude (source)
- Two provider buttons: ChatGPT | Claude (target) — can't pick same as source
- Password input for source API key
- Password input for target API key
- "Load Chats" button → calls `openai.js` or `anthropic.js` to fetch chat list
- Loading bar while fetching

On success → `setChats(data)` → `setStep("select")`

---

### STEP 6 — Services

**File: `src/services/openai.js`**
```js
export async function fetchChatGPTChats(apiKey) {
  const res = await fetch("https://api.openai.com/v1/conversations", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Invalid OpenAI key or API error");
  const data = await res.json();
  return data.items; // array of conversation objects
}

export async function fetchChatMessages(apiKey, conversationId) {
  const res = await fetch(`https://api.openai.com/v1/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  return data.mapping; // full message tree
}
```

**File: `src/services/anthropic.js`**
```js
// NOTE: Claude does not have a public "list conversations" API yet.
// For MVP, we handle Claude as TARGET only (import into Claude Projects via API).
// Sending messages to Claude uses the standard /v1/messages endpoint.

export async function sendToClaudeProject(apiKey, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages,
    }),
  });
  return res.json();
}
```

**File: `src/services/migrator.js`**
```js
// Core migration loop
// Takes: selectedChats, sourceKey, targetKey, targetProvider, addLog callback

export async function runMigration({ chats, sourceKey, targetKey, targetProvider, addLog, onProgress }) {
  let done = 0;

  for (const chat of chats) {
    addLog(`⏳ Migrating: "${chat.title}"`, "info");

    try {
      // 1. Fetch full messages from source
      // const messages = await fetchChatMessages(sourceKey, chat.id);

      // 2. Format messages for target
      // const formatted = formatForTarget(messages, targetProvider);

      // 3. Push to target
      // await sendToTarget(targetKey, targetProvider, formatted);

      addLog(`✅ "${chat.title}" — done`, "success");
    } catch (err) {
      addLog(`❌ "${chat.title}" — ${err.message}`, "error");
    }

    done++;
    onProgress(Math.round((done / chats.length) * 100));
  }
}
```

---

### STEP 7 — ChatList Component

**File: `src/components/ChatList.jsx`**

UI:
- Search bar
- "Select All / Deselect All" toggle
- Scrollable list of chat cards (checkbox, title, message count, date, size)
- Footer: back button + "Migrate N Chats →" button

---

### STEP 8 — MigrationPanel Component

**File: `src/components/MigrationPanel.jsx`**

UI:
- Overall progress bar (0–100%)
- "X / N chats migrated" counter
- Scrollable live log panel
  - Green for success ✅
  - Amber for warnings ⚠️
  - Red for errors ❌
  - Gray for info

Calls `migrator.js → runMigration()` on mount.

---

### STEP 9 — DoneScreen Component

**File: `src/components/DoneScreen.jsx`**

UI:
- Big 🎉 icon
- Stats: chats migrated, messages imported, success rate
- "Export Report" button → downloads JSON
- "Start New Migration" → resets state

---

## KNOWN LIMITATIONS (MVP)

| Limitation | Note |
|---|---|
| CORS | OpenAI/Anthropic block direct browser calls. Need a small Express proxy or use Vite proxy config |
| Claude has no "list chats" API | Claude is TARGET only in MVP |
| Rate limits | Add delay between API calls in migrator loop |
| Large chats | Chunk messages > 100 per request |

---

## VITE PROXY (to fix CORS in dev)

**File: `vite.config.js`**
```js
export default {
  server: {
    proxy: {
      "/openai": {
        target: "https://api.openai.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai/, ""),
      },
      "/anthropic": {
        target: "https://api.anthropic.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/anthropic/, ""),
      },
    },
  },
};
```

Then in `openai.js` use `/openai/v1/...` instead of the full URL.

---

## NEXT STEPS AFTER MVP

- [ ] Add backend (Node/Express) for production proxy
- [ ] Support Claude → Claude (same platform, different project)
- [ ] Bulk export to JSON/Markdown
- [ ] Electron wrapper for desktop app
- [ ] Support for Gemini, Grok

---

## CURRENT STATUS

- [ ] Step 0 — Bootstrap
- [ ] Step 1 — Tailwind config
- [ ] Step 2 — AppContext
- [ ] Step 3 — App entry
- [ ] Step 4 — StepBar
- [ ] Step 5 — ApiKeySetup
- [ ] Step 6 — Services
- [ ] Step 7 — ChatList
- [ ] Step 8 — MigrationPanel
- [ ] Step 9 — DoneScreen

---

> Start with Step 0 and check off as you go.
> Ask Claude in VS Code (or here) to generate each file when ready.
