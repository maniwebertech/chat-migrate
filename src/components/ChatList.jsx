import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ChatList() {
  const { chats, selectedIds, setSelectedIds, setStep } = useApp();
  const [search, setSearch] = useState("");

  const filtered = chats.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.add(c.id));
        return next;
      });
    }
  };

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select Chats</h1>
        <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{chats.length} conversations loaded.</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-amber-400/50"
        />
        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-white/20 rounded text-gray-500 dark:text-white/60 hover:border-gray-400 dark:hover:border-white/40 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-gray-400 dark:text-white/30 text-sm text-center py-8">No chats found.</p>
        )}
        {filtered.map(chat => (
          <ChatCard
            key={chat.id}
            chat={chat}
            selected={selectedIds.has(chat.id)}
            onToggle={() => toggleOne(chat.id)}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={() => setStep("setup")}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-white/20 rounded text-gray-400 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep("migrate")}
          disabled={selectedIds.size === 0}
          className="flex-1 py-2 bg-amber-400 text-black font-bold rounded hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Migrate {selectedIds.size} Chat{selectedIds.size !== 1 ? "s" : ""} →
        </button>
      </div>
    </div>
  );
}

function ChatCard({ chat, selected, onToggle }) {
  const date = chat.create_time
    ? new Date(chat.create_time * 1000).toLocaleDateString()
    : "—";

  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3 rounded border cursor-pointer transition-all
        ${selected
          ? "border-amber-400/50 bg-amber-400/5"
          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02]"}`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
          ${selected ? "border-amber-400 bg-amber-400" : "border-gray-300 dark:border-white/30"}`}
      >
        {selected && <span className="text-black text-[10px] font-bold">✓</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white truncate">{chat.title || "Untitled"}</p>
        <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{date}</p>
      </div>
    </div>
  );
}
