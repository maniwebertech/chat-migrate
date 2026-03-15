import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [step, setStep] = useState("setup");
  const [apiKeys, setApiKeys] = useState({ openai: "", anthropic: "" });
  const [sourceProvider, setSourceProvider] = useState(null);
  const [targetProvider, setTargetProvider] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [migrationLog, setMigrationLog] = useState([]);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    const hour = new Date().getHours();
    return hour >= 6 && hour < 19 ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const addLog = (msg, type = "info") => {
    setMigrationLog(prev => [
      ...prev,
      { msg, type, ts: new Date().toLocaleTimeString() }
    ]);
  };

  return (
    <AppContext.Provider value={{
      step, setStep,
      apiKeys, setApiKeys,
      sourceProvider, setSourceProvider,
      targetProvider, setTargetProvider,
      chats, setChats,
      selectedIds, setSelectedIds,
      migrationLog, setMigrationLog, addLog,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
