import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { parseExportFile } from "../services/openai";
import { parseClaudeExportFile } from "../services/anthropic";

const SOURCES = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude",  label: "Claude" },
];

const TARGETS = [
  { id: "claude",   label: "Claude",   note: "via API" },
  { id: "json",     label: "JSON",     note: "download file" },
  { id: "markdown", label: "Markdown", note: "download file" },
  { id: "chatgpt",  label: "ChatGPT",  note: "not supported", disabled: true },
];

export default function ApiKeySetup() {
  const {
    setStep, apiKeys, setApiKeys,
    sourceProvider, setSourceProvider,
    targetProvider, setTargetProvider,
    setChats,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const needsAnthropicKey = targetProvider === "claude";

  const handleLoadChats = async () => {
    if (!sourceProvider || !targetProvider) {
      setError("Select both source and target.");
      return;
    }
    if (!fileRef.current?.files[0]) {
      setError("Upload your conversations.json from your data export.");
      return;
    }
    if (needsAnthropicKey && !apiKeys.anthropic) {
      setError("Enter your Anthropic API key.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      let chats;
      if (sourceProvider === "chatgpt") {
        chats = await parseExportFile(fileRef.current.files[0]);
      } else {
        chats = await parseClaudeExportFile(fileRef.current.files[0]);
      }
      setChats(chats);
      setStep("select");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (id) => {
    setSourceProvider(id);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded p-3 text-xs text-blue-700 dark:text-blue-300">
        <span className="text-base leading-none mt-0.5">🔒</span>
        <div>
          <p className="font-semibold mb-0.5">Your keys never leave your browser</p>
          <p className="text-blue-600/80 dark:text-blue-300/70">API keys are stored in memory only and sent directly to OpenAI / Anthropic — never to any third-party server. This app has no backend.</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Migration</h1>
        <p className="text-gray-500 dark:text-white/50 text-sm mt-1">Choose providers and upload your export file.</p>
      </div>

      <Section label="Source (migrate FROM)">
        <div className="flex gap-3">
          {SOURCES.map(p => (
            <ProviderBtn
              key={p.id}
              label={p.label}
              active={sourceProvider === p.id}
              disabled={targetProvider === p.id}
              onClick={() => handleSourceChange(p.id)}
            />
          ))}
        </div>
      </Section>

      <Section label="Target (migrate TO)">
        <div className="grid grid-cols-2 gap-3">
          {TARGETS.map(p => (
            <ProviderBtn
              key={p.id}
              label={p.label}
              note={p.note}
              active={targetProvider === p.id}
              disabled={p.disabled || sourceProvider === p.id}
              disabledReason={p.disabled ? "OpenAI has no import API" : undefined}
              onClick={() => !p.disabled && setTargetProvider(p.id)}
            />
          ))}
        </div>
      </Section>

      {sourceProvider && (
        <Section label={`${sourceProvider === "chatgpt" ? "ChatGPT" : "Claude"} Export File`}>
          <div
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-gray-300 dark:border-white/20 rounded px-4 py-5 text-center cursor-pointer hover:border-amber-400/70 hover:bg-amber-400/5 transition-all"
          >
            {fileName
              ? <p className="text-amber-500 dark:text-amber-400 text-sm">{fileName}</p>
              : <p className="text-gray-400 dark:text-white/50 text-sm">Click to upload conversations.json</p>}
            <p className="text-gray-400 dark:text-white/25 text-xs mt-1">
              {sourceProvider === "chatgpt"
                ? "ChatGPT → Settings → Data Controls → Export Data → unzip"
                : "Claude.ai → Settings → Privacy → Export Data → unzip"}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={e => setFileName(e.target.files[0]?.name || "")}
            className="hidden"
          />
        </Section>
      )}

      {needsAnthropicKey && (
        <Section label="Anthropic API Key">
          <input
            type="password"
            placeholder="sk-ant-..."
            value={apiKeys.anthropic}
            onChange={e => setApiKeys(k => ({ ...k, anthropic: e.target.value }))}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-amber-400/50"
          />
          <p className="text-gray-400 dark:text-white/30 text-xs mt-1">Stored in memory only — never saved to disk.</p>
        </Section>
      )}

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-400/10 rounded px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleLoadChats}
        disabled={loading}
        className="w-full py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Parsing file..." : "Load Chats →"}
      </button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-gray-400 dark:text-white/50 text-xs uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );
}

function ProviderBtn({ label, note, active, disabled, disabledReason, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabledReason}
      className={`py-2 px-3 rounded border text-sm font-semibold transition-all text-left
        ${active
          ? "border-amber-400 bg-amber-400/10 text-amber-500 dark:text-amber-400"
          : disabled
          ? "border-gray-100 dark:border-white/5 text-gray-300 dark:text-white/20 cursor-not-allowed"
          : "border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/60 hover:border-gray-400 dark:hover:border-white/40"}`}
    >
      <span>{label}</span>
      {note && (
        <span className={`block text-xs font-normal mt-0.5 ${active ? "text-amber-400/70" : "text-gray-400 dark:text-white/25"}`}>
          {note}
        </span>
      )}
    </button>
  );
}
