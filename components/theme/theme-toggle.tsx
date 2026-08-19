"use client";

import { Moon, Sun } from "reicon-react";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { toggleTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({
  className = "",
  locale = "en",
}: {
  className?: string;
  locale?: Locale;
}) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = LANDING_COPY[locale].theme[next];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex px-1.5 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground ${className}`.trim()}
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
