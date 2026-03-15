// Claude does not have a public "list conversations" API.
// Source data comes from the Claude.ai data export (ZIP → conversations.json).

export function parseClaudeExportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!Array.isArray(json)) {
          reject(new Error("Unexpected format — expected an array of conversations."));
          return;
        }
        // Normalise to a common shape: { id, title, create_time, mapping }
        const normalised = json.map(conv => ({
          id: conv.uuid,
          title: conv.name || "Untitled",
          create_time: conv.created_at ? new Date(conv.created_at).getTime() / 1000 : null,
          // Store raw claude messages for extraction
          _claudeMessages: conv.chat_messages || [],
        }));
        resolve(normalised);
      } catch {
        reject(new Error("Could not parse file — make sure it's conversations.json from your Claude.ai export."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

export function extractClaudeMessages(claudeMessages) {
  return claudeMessages
    .filter(m => m.text?.trim())
    .map(m => ({
      role: m.sender === "human" ? "user" : "assistant",
      content: m.text.trim(),
    }));
}

export async function sendToClaudeProject(apiKey, messages) {
  const res = await fetch("/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error (${res.status})`);
  }

  return res.json();
}
