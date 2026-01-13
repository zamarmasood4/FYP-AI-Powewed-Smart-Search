
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full backdrop-blur-xl border border-white/20 dark:border-white/10
                 hover:bg-white/20 dark:hover:bg-black/40 transition-all duration-300 
                 fixed bottom-6 right-6 z-50 shadow-lg"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-400 dark:to-orange-500 flex items-center justify-center shadow-inner">
        {isDarkMode ? (
          <Sun className="h-6 w-6 text-white" />
        ) : (
          <Moon className="h-6 w-6 text-white" />
        )}
      </div>
      <span className="sr-only">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
};

export default ThemeToggle;
