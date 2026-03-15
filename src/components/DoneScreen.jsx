import { useApp } from "../context/AppContext";

export default function DoneScreen() {
  const { migrationLog, selectedIds, setStep, setChats, setSelectedIds, setMigrationLog } = useApp();

  const success = migrationLog.filter(e => e.type === "success").length;
  const errors  = migrationLog.filter(e => e.type === "error").length;
  const total   = selectedIds.size;
  const rate    = total > 0 ? Math.round((success / total) * 100) : 0;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(migrationLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "migration-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setChats([]);
    setSelectedIds(new Set());
    setMigrationLog([]);
    setStep("setup");
  };

  return (
    <div className="space-y-8 text-center">
      <div>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Migration Complete</h1>
        <p className="text-gray-500 dark:text-white/50 text-sm mt-1">Here's your summary.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Migrated"     value={success}    color="text-green-500 dark:text-green-400" />
        <StatCard label="Errors"       value={errors}     color="text-red-500 dark:text-red-400" />
        <StatCard label="Success Rate" value={`${rate}%`} color="text-amber-500 dark:text-amber-400" />
      </div>

      <div className="text-xs text-gray-400 dark:text-white/30 border border-gray-200 dark:border-white/10 rounded p-3 text-left space-y-1">
        <p className="font-semibold text-gray-500 dark:text-white/40">ℹ️ About Claude imports</p>
        <p>Claude API migrations replay your conversation into a new session — they are not imported as persistent chats in Claude.ai. To keep conversations accessible, use the <strong>JSON</strong> or <strong>Markdown</strong> export and upload the file to a Claude Project.</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 py-3 border border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/70 rounded hover:border-gray-400 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
        >
          Export Report
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-3 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 transition-colors text-sm"
        >
          Start New Migration
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded p-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{label}</p>
    </div>
  );
}
