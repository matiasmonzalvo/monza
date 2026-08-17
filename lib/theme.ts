"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * The theme lives on <html> — the blocking script in `layout.tsx` puts it
 * there before first paint. React subscribes to that DOM state rather than
 * owning a second copy of it.
 */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme) {
  const root = document.documentElement;
  const themeColor = theme === "dark" ? "#000000" : "#ffffff";

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);
  document
    .querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
    ?.setAttribute("content", theme);
  emit();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Matches the script's fallback, so hydration renders what the server sent. */
function getServerSnapshot(): Theme {
  return "dark";
}

let boundToOS = false;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  // Follow the OS, but only until the visitor makes an explicit choice.
  if (!boundToOS) {
    boundToOS = true;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", (event) => {
      if (readStored()) return;
      apply(event.matches ? "dark" : "light");
    });
  }

  return () => {
    listeners.delete(onStoreChange);
  };
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Blocked storage: the theme still applies for this visit.
  }
  apply(theme);
}

export function toggleTheme() {
  setTheme(getSnapshot() === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
