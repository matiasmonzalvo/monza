"use client";

import { Dropdown, type DropdownVersion } from "@/components/library/dropdown";
import { Input, type InputVersion } from "@/components/library/input";
import { Navbar, type NavbarVersion } from "@/components/library/navbar";
import {
  Notification,
  type NotificationVersion,
} from "@/components/library/notification";
import { Select, type SelectVersion } from "@/components/library/select";
import { Tabs, type TabsVersion } from "@/components/library/tabs";
import { cn } from "@/lib/cn";

/**
 * Renders a library component by slug. One case per component — the only
 * place that maps registry data onto real components.
 */
export function ComponentPreview({
  slug,
  version,
  compact = false,
}: {
  slug: string;
  version: string;
  /** Set on the gallery cards, where there is a third of a page to work with. */
  compact?: boolean;
}) {
  switch (slug) {
    case "navbar":
      // `absolute` keeps the bar pinned to the preview box rather than to the
      // viewport, where it would float over the whole page.
      return (
        <Navbar
          version={version as NavbarVersion}
          position="absolute"
          layout={compact ? "mobile" : "responsive"}
        />
      );
    case "notification":
      return <Notification version={version as NotificationVersion} />;
    case "dropdown":
      return <Dropdown version={version as DropdownVersion} />;
    case "select":
      return <Select version={version as SelectVersion} />;
    case "input":
      return <Input version={version as InputVersion} />;
    case "tabs":
      return <Tabs version={version as TabsVersion} />;
    default:
      return null;
  }
}

/** Width the preview looks best at, per component. */
export function previewWidth(slug: string): string {
  switch (slug) {
    case "navbar":
      return "w-full";
    case "notification":
      return "w-full";
    default:
      return "w-auto";
  }
}

/**
 * How the preview area frames the component. The navbar hangs off the top
 * edge, so it gets no top padding — that is the whole point of its shape.
 */
export function previewFrame(slug: string, compact = false): string {
  switch (slug) {
    case "navbar":
      // On a card the bar runs rail to rail like every other preview, its
      // flares landing exactly on the edges; the component page keeps a
      // margin so the silhouette sits clear of the section rules.
      return compact
        ? "items-start justify-center pb-10 pt-0"
        : "items-start justify-center px-4 pb-10 pt-0";
    default:
      return "items-center justify-center";
  }
}

/**
 * ────────────────────────────────────────────────────────────────
 *  WALLPAPER
 *  One diagonal gradient, four palettes — plain Tailwind stops, so a
 *  swatch is changed by swapping a colour name. Each component keeps its
 *  own colours wherever it is previewed, so a card in the gallery and the
 *  component's own page always read the same.
 * ────────────────────────────────────────────────────────────────
 */
const WALLPAPER: Record<string, string> = {
  navbar: "bg-linear-to-br from-amber-100 via-rose-100 to-indigo-200",
  notification: "bg-linear-to-br from-emerald-100 via-teal-100 to-sky-200",
  dropdown: "bg-linear-to-br from-orange-100 via-rose-200 to-fuchsia-200",
  select: "bg-linear-to-br from-violet-100 via-indigo-100 to-sky-200",
  tabs: "bg-linear-to-br from-sky-100 via-cyan-100 to-emerald-200",
  input: "bg-linear-to-br from-rose-100 via-orange-100 to-amber-200",
};

/** The gradient classes for a slug. */
export function previewBackground(slug: string): string {
  return WALLPAPER[slug] ?? WALLPAPER.navbar;
}

/**
 * The wash behind a preview. Sits under the component and never catches a
 * pointer, so it stays purely decorative. The parent must be `relative`.
 */
export function PreviewBackdrop({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0",
        previewBackground(slug),
        className,
      )}
    />
  );
}
