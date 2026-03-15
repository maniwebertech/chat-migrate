import { extractMessages } from "./openai";
import { extractClaudeMessages, sendToClaudeProject } from "./anthropic";
import { exportAsJSON, exportAsMarkdown } from "./exporter";

const DELAY_MS = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMessages(chat, sourceProvider) {
  if (sourceProvider === "claude") {
    return extractClaudeMessages(chat._claudeMessages || []);
  }
  // chatgpt
  return extractMessages(chat.mapping);
}

export async function runMigration({ chats, sourceProvider, targetKey, targetProvider, addLog }) {
  if (chats.length === 0) {
    addLog("No chats selected.", "warning");
    return;
  }

  addLog(`Starting migration of ${chats.length} chat(s) → ${targetProvider}...`, "info");

  // File-based targets: process all at once then download
  if (targetProvider === "json" || targetProvider === "markdown") {
    const prepared = [];

    for (const chat of chats) {
      const title = chat.title || "Untitled";
      const messages = getMessages(chat, sourceProvider);

      if (messages.length === 0) {
        addLog(`⚠️ "${title}" — no messages, skipping`, "warning");
        continue;
      }

      prepared.push({ ...chat, _normalizedMessages: messages });
      addLog(`✅ "${title}" — ${messages.length} messages`, "success");
    }

    if (prepared.length > 0) {
      addLog(`Generating ${targetProvider.toUpperCase()} file...`, "info");
      if (targetProvider === "json") exportAsJSON(prepared);
      else exportAsMarkdown(prepared);
      addLog(`Download started.`, "info");
    }

    return;
  }

  // API-based target (claude)
  for (const chat of chats) {
    const title = chat.title || "Untitled";
    addLog(`Processing: "${title}"`, "info");

    try {
      const messages = getMessages(chat, sourceProvider);

      if (messages.length === 0) {
        addLog(`⚠️ "${title}" — no messages found, skipping`, "warning");
        continue;
      }

      addLog(`  ${messages.length} messages. Sending to Claude...`, "info");

      const CHUNK = 50;
      for (let i = 0; i < messages.length; i += CHUNK) {
        const chunk = messages.slice(i, i + CHUNK);
        if (chunk[0].role !== "user") {
          chunk.unshift({ role: "user", content: "[Migration start]" });
        }
        await sendToClaudeProject(targetKey, chunk);
        if (i + CHUNK < messages.length) await sleep(300);
      }

      addLog(`✅ "${title}" — done`, "success");
    } catch (err) {
      addLog(`❌ "${title}" — ${err.message}`, "error");
    }

    await sleep(DELAY_MS);
  }

  addLog("Migration complete.", "info");
}
