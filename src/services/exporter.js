// File-based export targets: JSON and Markdown

export function exportAsJSON(chats) {
  const blob = new Blob([JSON.stringify(chats, null, 2)], { type: "application/json" });
  triggerDownload(blob, "conversations-export.json");
}

export function exportAsMarkdown(chats) {
  const parts = chats.map(chat => {
    const title = chat.title || "Untitled";
    const messages = (chat._normalizedMessages || [])
      .map(m => `**${m.role === "user" ? "You" : "Assistant"}:**\n\n${m.content}`)
      .join("\n\n---\n\n");
    return `# ${title}\n\n${messages}`;
  });

  const blob = new Blob([parts.join("\n\n\n---\n\n\n")], { type: "text/markdown" });
  triggerDownload(blob, "conversations-export.md");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
