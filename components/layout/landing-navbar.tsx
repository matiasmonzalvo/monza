"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

export type NavbarVersion = "border" | "solid" | "blur";

/**
 * ────────────────────────────────────────────────────────────────
 *  SHAPE — shared by every version, never changes between them.
 *
 *  FLARE  concave radius where the bar meets the top edge. The sides
 *         curve *outwards* into the ceiling, like the macOS notch.
 *  RADIUS convex radius on the two bottom corners.
 * ────────────────────────────────────────────────────────────────
 */
const FLARE = 24;
const RADIUS = 22;

/**
 * Carves the concave corner: everything within FLARE of the wing's inner
 * bottom corner is masked away, leaving the arc that meets the bar's side
 * vertically and the ceiling horizontally.
 */
function flareMask(side: "left" | "right") {
  const origin = side === "left" ? "0% 100%" : "100% 100%";
  return `radial-gradient(circle at ${origin}, transparent ${FLARE}px, #000 ${FLARE + 0.5}px)`;
}

/**
 * ────────────────────────────────────────────────────────────────
 *  VERSIONS
 *  Only the fill changes — background, backdrop and outline.
 *  The silhouette above is identical in all of them.
 * ────────────────────────────────────────────────────────────────
 */
const STYLES = {
  border: {
    fill: "bg-background",
    // Traces a 1px rim around the whole silhouette, curves included.
    outline:
      "[filter:drop-shadow(0_1px_0_var(--border))_drop-shadow(0_-1px_0_var(--border))_drop-shadow(1px_0_0_var(--border))_drop-shadow(-1px_0_0_var(--border))]",
  },
  solid: {
    fill: "bg-surface-2",
    outline: "",
  },
  blur: {
    fill: "bg-muted/60 backdrop-blur-3xl",
    outline: "",
  },
} satisfies Record<NavbarVersion, Record<string, string>>;

const NAV = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Skills", href: "/#skills" },
];

const MENU_ID = "landing-navbar-menu";

export function LandingNavbar({
  version = "border",
  className,
}: {
  version?: NavbarVersion;
  className?: string;
}) {
  const s = STYLES[version];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex w-full px-6  fixed z-50 flex-col items-center",
        className,
      )}
    >
      <div className="relative max-w-3xl w-full ">
        {/* Shape layer. Kept free of text so the outline filter traces only
            the silhouette and never haloes the content. It spans the bar *and*
            the drawer below it, so opening the menu simply stretches the same
            silhouette — the flares are pinned to `top-0` at a fixed size, which
            leaves the concave corners untouched however tall the bar grows. */}
        <div aria-hidden="true" className={cn("absolute inset-0", s.outline)}>
          <span
            className={cn("absolute top-0 right-full", s.fill)}
            style={{
              width: FLARE,
              height: FLARE,
              maskImage: flareMask("left"),
              WebkitMaskImage: flareMask("left"),
            }}
          />
          <span
            className={cn("absolute inset-0", s.fill)}
            style={{ borderRadius: `0 0 ${RADIUS}px ${RADIUS}px` }}
          />
          <span
            className={cn("absolute top-0 left-full", s.fill)}
            style={{
              width: FLARE,
              height: FLARE,
              maskImage: flareMask("right"),
              WebkitMaskImage: flareMask("right"),
            }}
          />
        </div>

        {/* Content sits above the shape. */}
        <nav
          aria-label="Main"
          data-landing-navbar
          className="relative flex h-14 items-center gap-3 px-4 sm:gap-6"
        >
          <Link href="/#top" className="flex shrink-0 items-center gap-2.5">
            <span className="text-xl font-medium tracking-tight text-foreground">
              Monza<span className="text-primary">.</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/#contact"
              className="inline-flex h-7 shrink-0 items-center rounded-lg bg-primary px-3.5 text-[13px] font-semibold tracking-tight text-white transition-opacity hover:opacity-80 hover:text-foreground"
            >
              Get in touch
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={MENU_ID}
              aria-label="Toggle menu"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              {/* Two bars folding into an X. `justify-between` inside a 10px
                  box leaves each bar 4px off centre — exactly the distance the
                  translate closes before the rotation lands. */}
              <span
                aria-hidden="true"
                className="flex h-2.5 w-5 flex-col justify-between"
              >
                <span
                  className={cn(
                    "block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-in-out motion-reduce:transition-none",
                    open && "translate-y-[4px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 ease-in-out motion-reduce:transition-none",
                    open && "-translate-y-[4px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Drawer. Lives inside the shape box so the bar itself grows around
            it. `grid-rows-[0fr → 1fr]` animates the height without pinning a
            magic max-height; the inner `overflow-hidden` is what lets the row
            collapse past its content. */}
        <div
          id={MENU_ID}
          inert={!open}
          className={cn(
            "relative grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none sm:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden px-4">
            <ul className="space-y-0.5  pb-3">
              {NAV.map((item, index) => (
                <li
                  key={item.href}
                  className={cn(
                    "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                    open
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0",
                  )}
                  // Items trail the expansion on the way in, and leave at once.
                  style={{
                    transitionDelay: open ? `${80 + index * 50}ms` : "0ms",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg  py-2.5 text-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
