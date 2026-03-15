// ChatGPT does not expose a public "list conversations" REST API.
// Source data comes from the ChatGPT data export (ZIP → conversations.json).

export function parseExportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        // conversations.json is an array of conversation objects
        if (!Array.isArray(json)) {
          reject(new Error("Unexpected format — expected an array of conversations."));
          return;
        }
        resolve(json);
      } catch {
        reject(new Error("Could not parse file — make sure it's conversations.json from your ChatGPT export."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

export function extractMessages(mapping) {
  if (!mapping) return [];

  const nodes = Object.values(mapping);
  const root = nodes.find(n => !n.parent);
  if (!root) return [];

  const messages = [];

  function walk(nodeId) {
    const node = mapping[nodeId];
    if (!node) return;
    const msg = node.message;
    if (msg && msg.content?.parts?.length && msg.author?.role !== "system") {
      const role = msg.author.role === "assistant" ? "assistant" : "user";
      const text = msg.content.parts.filter(p => typeof p === "string").join("").trim();
      if (text) messages.push({ role, content: text });
    }
    (node.children || []).forEach(walk);
  }

  walk(root.id);
  return messages;
}
