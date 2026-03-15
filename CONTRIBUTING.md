# Contributing to ChatMigrate

Thank you for your interest in contributing. ChatMigrate is an open-source project and contributions of all kinds are welcome — whether you are fixing a typo, reporting a bug, adding a feature, or improving the docs.

---

## Ways to contribute

- **Bug reports** — Found something broken? Open a GitHub Issue.
- **Feature requests** — Have an idea? Open a GitHub Issue with the `enhancement` label.
- **Code** — Pick up an open issue or implement something from the roadmap.
- **Documentation** — Improve the README, add inline comments, or write guides.
- **Testing** — Add test fixtures, test edge cases, or help test on different browsers.

---

## Getting started locally

1. **Fork** the repository on GitHub.

2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/chat-migrate.git
   cd chat-migrate
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

You can use the included `sample_conversations.json` file as a test fixture — no real API export needed to develop locally.

---

## Project structure overview

```
src/
  context/         Global state via React Context (AppContext.jsx)
  components/      One file per UI step/screen
  services/        API and migration logic, no UI
```

Keep this separation clean. UI concerns belong in `components/`, API calls and data transformation belong in `services/`, and shared state belongs in `context/`.

---

## Code style

- **React functional components only** — no class components.
- **Tailwind CSS for all styling** — avoid inline styles and separate CSS files except for `index.css` (which only contains the Tailwind directives).
- **No external state management libraries** — use `useState`, `useReducer`, and `useContext` from React itself.
- **All API interaction lives in `src/services/`** — components should not call `fetch` directly.
- **No `console.log` in committed code** — use the `addLog` callback from `AppContext` to surface messages to the user.
- **API keys must never be logged** — do not pass keys to `addLog`, do not include them in error messages, do not log them anywhere. This is a hard rule.
- Keep components focused and small. If a component grows beyond ~150 lines, consider splitting it.

---

## Pull request guidelines

### Branch naming

| Type | Pattern | Example |
|---|---|---|
| New feature | `feat/<short-description>` | `feat/markdown-export` |
| Bug fix | `fix/<short-description>` | `fix/progress-bar-overflow` |
| Documentation | `docs/<short-description>` | `docs/improve-readme` |
| Refactor | `refactor/<short-description>` | `refactor/migrator-loop` |

### Before opening a PR

- Make sure `npm run dev` starts without errors.
- Run `npm run build` and confirm it produces a clean build.
- Keep PRs small and focused on a single concern. Large multi-feature PRs are hard to review.
- Write a clear PR description explaining **what** the change does and **why** it is needed.
- If the PR closes an issue, add `Closes #<issue-number>` in the description.

### Review process

All PRs need at least one approving review before merge. Be responsive to feedback — small, focused PRs get reviewed faster.

---

## Reporting issues

Use [GitHub Issues](https://github.com/your-org/chat-migrate/issues) for all bug reports and feature requests.

When reporting a bug, please include:

- **Browser and version** (e.g., Chrome 124, Firefox 126, Safari 17)
- **Operating system**
- **Steps to reproduce** — be specific
- **Expected behavior** — what should happen
- **Actual behavior** — what actually happens
- **Screenshots or console output** if relevant

Do **not** include API keys, export files with real conversation data, or any personal information in issue reports.

---

## Security

If you discover a security vulnerability — especially anything related to API key handling or data leakage — please do **not** open a public issue. Instead, open a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/creating-a-repository-security-advisory) so it can be addressed before public disclosure.

The single most important security rule in this codebase: **API keys are never logged, never stored to disk, and never transmitted to any server other than the provider's own API.** Any PR that violates this will not be merged.

---

## Help wanted

These are the areas where contributions would have the most impact right now:

- **Backend proxy** — A thin Node/Express server to handle CORS in production, so the Vite dev proxy is not required.
- **More export formats** — Per-conversation Markdown files, HTML export, plain text.
- **Electron wrapper** — Package the app as a desktop app to eliminate CORS issues entirely and enable local file system access.
- **Gemini and Grok support** — Add `src/services/gemini.js` and `src/services/grok.js` following the same pattern as `openai.js`.
- **Test coverage** — Unit tests for the service layer (`migrator.js`, `openai.js`, `anthropic.js`).

---

Thank you for helping make ChatMigrate better.
