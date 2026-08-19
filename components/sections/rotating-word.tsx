"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * ────────────────────────────────────────────────────────────────
 *  WORDS
 *  Each word carries its own treatment. Add one by appending here —
 *  the drum, the sizing and the timing all follow automatically.
 * ────────────────────────────────────────────────────────────────
 */
const WORD_STYLES = [
  {
    // Gradient poured through the glyphs.
    className: cn(
      "[background-image:linear-gradient(135deg,#A855F7_0%,#6366F1_45%,#c6005c_65%,var(--background)_95%)]",
      "bg-clip-text text-transparent [-webkit-background-clip:text]",
    ),
  },
  {
    // Filled with the page colour, held together by an outline.
    className: cn(
      "text-background",
      "[-webkit-text-stroke:1px_var(--foreground)]",
      "lg:[-webkit-text-stroke:1px_var(--foreground)]",
    ),
  },
  {
    // Hazard stripes, crawling.
    className: cn(
      "[background-image:repeating-linear-gradient(45deg,#FBBF24_0px,#FBBF24_10px,#F97316_10px,#F97316_20px)]",
      "bg-clip-text text-transparent [-webkit-background-clip:text]",
      "animate-stripes",
    ),
  },
];

/** How long each word holds before the drum turns. */
const INTERVAL = 2600;

export function RotatingWord({
  className,
  locale = "en",
}: {
  className?: string;
  locale?: Locale;
}) {
  const copy = LANDING_COPY[locale].hero;
  const words = copy.rotatingWords.map((text, index) => ({
    text,
    className: WORD_STYLES[index].className,
  }));
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState({ index: 0, previous: -1 });
  const [width, setWidth] = useState<number | null>(null);
  const sizerRef = useRef<HTMLSpanElement | null>(null);

  // Turn the drum.
  useEffect(() => {
    if (reducedMotion) return;

    const id = setInterval(() => {
      setState((current) => ({
        index: (current.index + 1) % words.length,
        previous: current.index,
      }));
    }, INTERVAL);

    return () => clearInterval(id);
  }, [reducedMotion, words.length]);

  // The box tracks the live word's width so "Product" glides rather than
  // jumping. ResizeObserver reports the initial size on observe(), so there
  // is no measuring pass and no setState in the effect body.
  useEffect(() => {
    const element = sizerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const active = words[state.index];
  const leaving = state.previous >= 0 ? words[state.previous] : null;

  return (
    <span
      className={cn(
        "relative inline-block whitespace-nowrap transition-[width] duration-700 ease-out",
        className,
      )}
      style={width !== null ? { width } : undefined}
    >
      {/* Sets the width and the baseline. Never seen, never read. */}
      <span
        ref={sizerRef}
        aria-hidden="true"
        className="invisible inline-block"
      >
        {active.text}
      </span>

      {/* A stable heading for assistive tech, instead of a word that
          changes under the reader every few seconds. */}
      <span className="sr-only">{copy.rotatingLabel}</span>

      {leaving ? (
        <span
          key={`out-${state.previous}`}
          aria-hidden="true"
          className="absolute left-0 top-0 animate-word-out"
        >
          {/* The turn lives on the wrapper so `filter` never lands on the
              same element as `background-clip: text`. */}
          <span className={leaving.className}>{leaving.text}</span>
        </span>
      ) : null}

      <span
        key={`in-${state.index}`}
        aria-hidden="true"
        className="absolute left-0 top-0 animate-word-in"
      >
        <span className={active.className}>{active.text}</span>
      </span>
    </span>
  );
}
