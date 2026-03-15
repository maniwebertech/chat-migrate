# Testing Guide

> No API credits? No real export file? No problem.
> Use the sample files below to test the full migration flow right now.

---

## Sample Files

| File | Simulates | Chats included |
|---|---|---|
| [`sample_conversations.json`](./sample_conversations.json) | ChatGPT data export | Python Sorting Help, React useEffect Question |
| [`sample_claude_conversations.json`](./sample_claude_conversations.json) | Claude.ai data export | JavaScript Async/Await, CSS Grid vs Flexbox, Git Rebase vs Merge |

Both files are real-format replicas — the same structure your actual export will have.

---

## How to Test: ChatGPT → JSON Export

The fastest end-to-end test. No API key needed.

**Steps:**

1. Run the app — `npm run dev` → open [http://localhost:5173](http://localhost:5173)
2. **Source** → click **ChatGPT**
3. **Target** → click **JSON**
4. Upload `sample_conversations.json`
5. Click **Load Chats →**
6. You should see 2 chats in the list:
   - ✅ Python Sorting Help
   - ✅ React useEffect Question
7. Click **Select All**, then **Migrate 2 Chats →**
8. Watch the live log — both chats should show ✅
9. A `chatgpt-export.json` file will download automatically
10. Click **View Summary →** — you should see **2 Migrated, 0 Errors, 100%**

---

## How to Test: ChatGPT → Markdown Export

Same steps as above but pick **Markdown** as the target.

A `chatgpt-export.md` file will download containing all conversations formatted as readable Markdown — great for archiving or pasting into Notion/Obsidian.

---

## How to Test: Claude → JSON Export

1. **Source** → click **Claude**
2. **Target** → click **JSON**
3. Upload `sample_claude_conversations.json`
4. Click **Load Chats →**
5. You should see 3 chats:
   - ✅ JavaScript Async Await
   - ✅ CSS Grid vs Flexbox
   - ✅ Git Rebase vs Merge
6. Select all → Migrate → download starts automatically

---

## How to Test: ChatGPT → Claude API

This requires a real Anthropic API key with credits.

1. **Source** → ChatGPT, **Target** → Claude
2. Upload `sample_conversations.json`
3. Enter your Anthropic API key (`sk-ant-...`)
4. Click **Load Chats →**, select chats, migrate
5. Each chat will be sent to the Claude API as a conversation replay
6. Check the live log — you should see ✅ for each chat

> **No credits?** Use the JSON or Markdown targets above to test everything else.
> Get credits at [console.anthropic.com/billing](https://console.anthropic.com/billing)

---

## How to Get Your Real Export Files

### ChatGPT
1. Go to [chat.openai.com](https://chat.openai.com) → click your profile picture → **Settings**
2. **Data Controls** → **Export Data** → confirm via email
3. Wait up to **24 hours** for the email with a download link
4. Unzip the file → use `conversations.json`

### Claude
1. Go to [claude.ai](https://claude.ai) → click your profile picture → **Settings**
2. **Privacy** → **Export Data** → confirm
3. Unzip the file → use `conversations.json`

---

## Running the Automated Tests

### Unit Tests (no browser, no server needed)

```bash
npm test
```

Runs 14 unit tests covering:
- `extractMessages` — ChatGPT message tree parsing
- `extractClaudeMessages` — Claude message format
- `parseExportFile` / `parseClaudeExportFile` — file parsing + error cases
- `runMigration` — migration loop, error handling, empty input

### Playwright E2E Tests (requires dev server)

```bash
# Start the dev server first (or let Playwright start it automatically)
npm run test:e2e
```

Runs tests on Chromium and Firefox covering:
- Validation errors (no file, no provider, etc.)
- Full migration flow with `sample_conversations.json`
- Search/filter, select all / deselect all
- Start New Migration reset

**Interactive mode (with browser UI):**
```bash
npm run test:e2e:ui
```

**Vitest UI (unit tests with a visual interface):**
```bash
npm run test:ui
```

---

## What Each Target Actually Does

| Target | What happens | Needs API key? |
|---|---|---|
| **JSON** | Downloads a `.json` file with all messages | No |
| **Markdown** | Downloads a `.md` file, human-readable | No |
| **Claude API** | Replays conversation into Claude via API | Yes (Anthropic) |

> **Note on Claude API migrations:** The API does not create persistent chats in Claude.ai. It replays the conversation as a session. To keep chats accessible long-term, use JSON or Markdown export and upload the file to a [Claude Project](https://claude.ai).
