import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { runMigration } from "../services/migrator";

export default function MigrationPanel() {
  const {
    chats, selectedIds, apiKeys,
    sourceProvider, targetProvider,
    migrationLog, addLog, setStep,
  } = useApp();

  const logRef = useRef(null);
  const ranRef = useRef(false);

  const selectedChats = chats.filter(c => selectedIds.has(c.id));
  const total = selectedChats.length;

  const doneCount = migrationLog.filter(e => e.type === "success" || e.type === "error").length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const finished = doneCount >= total && total > 0;

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    runMigration({
      chats: selectedChats,
      sourceProvider,
      targetKey: apiKeys.anthropic,
      targetProvider,
      addLog,
    });
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [migrationLog]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Migrating Chats</h1>
        <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{doneCount} / {total} complete</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400 dark:text-white/40">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-300 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        ref={logRef}
        className="h-72 overflow-y-auto bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded p-3 space-y-1 font-mono text-xs"
      >
        {migrationLog.length === 0 && (
          <p className="text-gray-400 dark:text-white/20">Starting migration...</p>
        )}
        {migrationLog.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </div>

      {finished && (
        <button
          onClick={() => setStep("done")}
          className="w-full py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors"
        >
          View Summary →
        </button>
      )}
    </div>
  );
}

function LogEntry({ entry }) {
  const colors = {
    success: "text-green-500 dark:text-green-400",
    error:   "text-red-500 dark:text-red-400",
    warning: "text-amber-500 dark:text-amber-400",
    info:    "text-gray-400 dark:text-white/50",
  };

  return (
    <div className={`flex gap-2 ${colors[entry.type] || "text-gray-400 dark:text-white/50"}`}>
      <span className="text-gray-300 dark:text-white/20 flex-shrink-0">{entry.ts}</span>
      <span>{entry.msg}</span>
    </div>
  );
}
