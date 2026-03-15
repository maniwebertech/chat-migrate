import { useApp } from "../context/AppContext";

const STEPS = [
  { key: "setup",   label: "Configure" },
  { key: "select",  label: "Select" },
  { key: "migrate", label: "Migrate" },
  { key: "done",    label: "Done" },
];

export default function StepBar() {
  const { step, theme, toggleTheme } = useApp();
  const currentIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] px-6 py-4 transition-colors duration-200">
      <div className="max-w-3xl mx-auto flex items-center gap-0">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isCompleted ? "bg-green-500 text-black" :
                      isCurrent  ? "bg-amber-400 text-black" :
                                   "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-white/40"}`}
                >
                  {isCompleted ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm
                    ${isCompleted ? "text-green-500 dark:text-green-400" :
                      isCurrent  ? "text-amber-500 dark:text-amber-400 font-bold" :
                                   "text-gray-400 dark:text-white/30"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < currentIndex ? "bg-green-400/50" : "bg-gray-200 dark:bg-white/10"}`} />
              )}
            </div>
          );
        })}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="ml-4 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-amber-400/50 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex-shrink-0"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </div>
  );
}
