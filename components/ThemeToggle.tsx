"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

type Theme = "light" | "dark";
const storageKey = "parkpal-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null;
    const initial = stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(storageKey, next);
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      aria-pressed={theme === "dark"}
      onClick={toggleTheme}
      className="theme-toggle focus-ring"
    >
      {theme === "light" ? <SunMedium /> : <Moon />}
      <span>{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}
