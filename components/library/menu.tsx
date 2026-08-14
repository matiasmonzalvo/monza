"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "reicon-react";
import { cn } from "@/lib/cn";

export type MenuVersion = "border" | "solid" | "blur";

const STYLES = {
  border: {
    trigger:
      "border-border bg-background text-foreground hover:border-border-strong hover:bg-surface",
    content:
      "border-border bg-background text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]",
    item: "text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:bg-surface-2 focus-visible:text-foreground",
    itemActive: "bg-surface-2 text-foreground",
    itemDanger: "text-danger hover:bg-danger/10 focus-visible:bg-danger/10",
  },
  solid: {
    trigger: "border-foreground bg-foreground text-background hover:opacity-85",
    content:
      "border-foreground bg-foreground text-background shadow-[0_16px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
    item: "text-background/70 hover:bg-background/10 hover:text-background focus-visible:bg-background/10 focus-visible:text-background",
    itemActive: "bg-background/10 text-background",
    itemDanger: "text-danger hover:bg-danger/15 focus-visible:bg-danger/15",
  },
  blur: {
    trigger:
      "border-0 bg-white/20 text-foreground backdrop-blur-md backdrop-saturate-150 hover:bg-white/30 dark:border-white/15 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
    content:
      "border-0 bg-white/35 text-foreground backdrop-blur-md backdrop-saturate-150 shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:border-white/15 dark:bg-white/[0.06] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
    item: "text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground",
    itemActive: "bg-foreground/10 text-foreground",
    itemDanger: "text-danger hover:bg-danger/10 focus-visible:bg-danger/10",
  },
} satisfies Record<MenuVersion, Record<string, string>>;

export function menuItemClassName(
  version: MenuVersion,
  { active = false, danger = false, disabled = false } = {},
) {
  const s = STYLES[version];

  return cn(
    "group flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13px]",
    "[corner-shape:squircle] transition-colors",
    danger ? s.itemDanger : s.item,
    active && !danger && s.itemActive,
    disabled && "pointer-events-none opacity-40",
  );
}

export function MenuShell({
  version,
  label,
  triggerLabel,
  popupRole,
  className,
  children,
}: {
  version: MenuVersion;
  label: string;
  triggerLabel: ReactNode;
  popupRole: "menu" | "listbox";
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  const s = STYLES[version];
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup={popupRole}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-4xl border px-4 text-sm font-medium",
          "[corner-shape:squircle] transition-[color,background-color,border-color,opacity] duration-150",
          s.trigger,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {triggerLabel}
        </span>
        <ChevronDown
          size={16}
          weight="Outline"
          aria-hidden="true"
          className={cn(
            "shrink-0 opacity-55 transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={contentId}
        role={popupRole}
        aria-label={`${label} options`}
        aria-hidden={!open}
        inert={!open}
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute left-0 top-[calc(100%+8px)] z-30 w-56 origin-top-left rounded-3xl border p-1.5",
          "[corner-shape:squircle] will-change-[opacity,transform,filter]",
          "transition-[opacity,transform,filter] duration-200 ease-out",
          open
            ? "pointer-events-auto opacity-100 "
            : "pointer-events-none  opacity-0",
          s.content,
        )}
      >
        {children(close)}
      </div>
    </div>
  );
}
