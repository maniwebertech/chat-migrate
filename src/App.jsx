import { useApp } from "./context/AppContext";
import StepBar from "./components/StepBar";
import ApiKeySetup from "./components/ApiKeySetup";
import ChatList from "./components/ChatList";
import MigrationPanel from "./components/MigrationPanel";
import DoneScreen from "./components/DoneScreen";

export default function App() {
  const { step, theme } = useApp();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-mono transition-colors duration-200">
        <StepBar />
        <main className="max-w-3xl mx-auto px-6 py-10">
          {step === "setup"   && <ApiKeySetup />}
          {step === "select"  && <ChatList />}
          {step === "migrate" && <MigrationPanel />}
          {step === "done"    && <DoneScreen />}
        </main>
        <footer className="text-center py-6 text-gray-400 dark:text-white/20 text-xs space-x-3">
          <a href="https://github.com/migastone/chat-migrate" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-white/50 transition-colors">GitHub</a>
          <span>·</span>
          <span>MIT License</span>
          <span>·</span>
          <span>No tracking. No server. Open source.</span>
        </footer>
      </div>
    </div>
  );
}
