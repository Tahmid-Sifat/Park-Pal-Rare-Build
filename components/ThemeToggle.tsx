"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

type Theme = "warm" | "vivid";
const storageKey = "parkpal-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("warm");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    const initial = stored === "vivid" ? "vivid" : "warm";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "warm" ? "vivid" : "warm";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(storageKey, next);
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "warm" ? "vivid" : "warm"} theme`}
      aria-pressed={theme === "vivid"}
      onClick={toggleTheme}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-app bg-app-surface px-3 py-2 text-sm font-black text-app shadow-sm"
    >
      {theme === "warm" ? <SunMedium className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
      <span>{theme === "warm" ? "Warm" : "Vivid"}</span>
    </button>
  );
}
