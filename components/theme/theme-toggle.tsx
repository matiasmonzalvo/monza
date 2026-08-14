"use client";

import { Moon, Sun } from "reicon-react";
import { toggleTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground ${className}`.trim()}
    >
      <Sun
        size={16}
        weight="Filled"
        aria-hidden="true"
        className="hidden dark:block"
      />
      <Moon
        size={16}
        weight="Filled"
        aria-hidden="true"
        className="block dark:hidden"
      />
    </button>
  );
}
