"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "reicon-react";
import { cn } from "@/lib/cn";

export type SelectVersion = "border" | "solid";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * ────────────────────────────────────────────────────────────────
 *  SHAPE — shared by every version, never changes between them.
 *
 *  Open, the trigger and the listbox are one body: the panel runs out
 *  past the trigger's right edge instead of floating under it.
 *
 *  RADIUS   convex radius, on every corner of that silhouette but one. A
 *           ceiling rather than a promise: no corner can be larger than half
 *           the box it sits on, so past half the trigger's height it only
 *           goes on paying off on the panel.
 *  PANEL_TOP   where the panel's top edge crosses the trigger, as a
 *              fraction of its height. One source of truth: the fill
 *              hangs from it and the arc lands on it, so they cannot
 *              drift apart.
 *  FLARE_START where the arc leaves the trigger's side, same units.
 *
 *              0.5 is not a taste call. `triggerRadius` caps at half
 *              the trigger's height, so the right edge is a semicircle
 *              — and a semicircle only reaches the trigger's full width
 *              at one point, its middle, where its tangent is vertical.
 *              The arc's own tangent is vertical at its top. Meeting
 *              there is the one way the two curves join with no corner
 *              left between them, at any trigger width.
 *
 *              Which leaves the arc's fall as arithmetic: the gap
 *              between where it may start and where it has to land,
 *              (PANEL_TOP − FLARE_START) × height.
 *
 *  FLARE_RADIUS how much rounder than that gap the arc is allowed to
 *              be. The fall *is* the arc's vertical radius — a curve
 *              tangent to a vertical edge at one end and a horizontal
 *              one at the other has no radius to spare — so the only
 *              way to round it further is to let it leave the trigger
 *              higher than the middle. That gives up the flush join,
 *              but cheaply: a pill's edge falls away from its widest
 *              point quadratically, so at 2 the arc clears it by 0.4px
 *              and at 3 by 1.7px. Past 3 the gap starts to show.
 *
 *  FLARE_RUN   how far the arc then runs out, as a multiple of that
 *              fall. 1 is a circle, turning in a quarter of its own
 *              width; above that the ellipse lies on its side — a short
 *              drop off the trigger and a long, shallow run out.
 *
 *  OVERHANG    how far the panel clears the trigger. The overhang *is*
 *              the concave corner: with none there is nothing to curve,
 *              so the panel is never allowed to be narrower than this.
 * ────────────────────────────────────────────────────────────────
 */
const RADIUS = 24;
const PANEL_TOP = 0.6;
const FLARE_START = 0.5;
const FLARE_RADIUS = 1.25;
const FLARE_RUN = 1;
const OVERHANG = 40;
const PANEL_MIN_W = 194;

/**
 * The panel's inner padding, and the row radius that follows from it.
 *
 * Corners nest by *subtracting the gap between them*. An inner box that is to
 * keep the same distance from an outer one the whole way round a corner has to
 * be exactly that much less round — hold both at the same radius and the two
 * curves converge on the diagonal, so the gap pinches shut at 45° and gapes on
 * the straights. RADIUS − PANEL_PAD is the one value that keeps it even, which
 * is why the rows are not a number of their own: move the component's radius
 * and they follow it.
 *
 * A row is `h-9`, so anything from 18 up renders as a full pill — that is the
 * browser refusing a radius taller than half the box, not a bug.
 */
const PANEL_PAD = 6;
const ITEM_RADIUS = Math.max(0, RADIUS - PANEL_PAD);

/**
 * How far the options start tucked up inside the trigger. They ride down as
 * the box grows, so the block reads as being drawn out of the body rather than
 * as something already sitting there waiting to be uncovered.
 */
const TUCK = 14;

/**
 * Carves the concave corner. A box sits in the notch at the trigger's bottom
 * right and a quarter ellipse pinned to that box's *outer* corner is masked
 * away; the arc left behind meets the trigger's side vertically at one end and
 * the panel's top horizontally at the other.
 *
 * Both radii are 100%, so the ellipse is whatever shape the box is. That is
 * what FLARE_RUN steers — a box twice as wide as it is tall gives an arc that
 * falls fast and runs out flat — and it is also why the curve is drawn as it
 * goes: grow the box and the arc grows with it, keeping its proportions.
 */
const FLARE_MASK =
  "radial-gradient(ellipse 100% 100% at 100% 0%, transparent calc(100% - 0.5px), #000 100%)";

/** One timing for the whole silhouette, so nothing arrives out of step. */
const GROW = "duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]";

/**
 * ────────────────────────────────────────────────────────────────
 *  VERSIONS
 *  Only the fill changes — background and outline. The silhouette
 *  above is identical in both of them.
 * ────────────────────────────────────────────────────────────────
 */
const STYLES = {
  border: {
    fill: "bg-background",
    // Traces a 1px rim around the whole silhouette, the concave arc included.
    outline:
      "[filter:drop-shadow(0_1px_0_var(--border))_drop-shadow(0_-1px_0_var(--border))_drop-shadow(1px_0_0_var(--border))_drop-shadow(-1px_0_0_var(--border))]",
    trigger: "text-foreground",
    item: "text-muted-foreground hover:bg-surface-2 hover:text-foreground focus-visible:bg-surface-2 focus-visible:text-foreground",
    itemActive: "bg-surface-2 text-foreground",
  },
  solid: {
    fill: "bg-muted",
    outline: "",
    trigger: "text-foreground",
    item: "text-foreground/70 hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground",
    itemActive: "bg-foreground/10 text-foreground",
  },
} satisfies Record<SelectVersion, Record<string, string>>;

const DEFAULT_OPTIONS: SelectOption[] = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export function Select({
  version = "border",
  label = "Plan",
  placeholder = "Select a plan",
  options = DEFAULT_OPTIONS,
  defaultValue,
  onValueChange,
  className,
}: {
  version?: SelectVersion;
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const s = STYLES[version];
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [trigger, setTrigger] = useState({ width: 0, height: 0 });
  const [panelHeight, setPanelHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value);

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

  /**
   * The silhouette is animated in real units, so it has to know two of them:
   * where the trigger ends, and how tall the options come out. Measured rather
   * than guessed — editing a row cannot leave the shape behind, and a longer
   * selection cannot eat the overhang.
   *
   * Neither reading is affected by the panel, which is absolutely positioned,
   * so this settles on the first pass instead of chasing itself.
   */
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const observer = new ResizeObserver(() => {
      setTrigger({ width: root.offsetWidth, height: root.offsetHeight });
      setPanelHeight(panel.offsetHeight);
    });
    observer.observe(root);
    observer.observe(panel);

    return () => observer.disconnect();
  }, []);

  /**
   * Nothing may transition until the first reading has landed and been painted.
   * Every number the silhouette is built from starts at zero, so the
   * measurement arriving is itself a change — with transitions already live it
   * plays as an animation on load, which is the radius visibly tightening from
   * its fallback to what the trigger can hold, unprompted, on every reload.
   *
   * A frame late, and deliberately: switching this on in the same commit as
   * the readings would not help, because a transition is decided by the style
   * the change lands *in*, not the one it left. On its own frame there is no
   * value moving alongside it, so there is nothing to interpolate.
   */
  useEffect(() => {
    if (ready || !trigger.height) return;

    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [ready, trigger.height]);

  /**
   * The arc, in pixels. Its fall is the gap it has to bridge — from the
   * trigger's widest point down to the panel's top edge — so the trigger's
   * height is what sets it, with FLARE_RADIUS buying more curve by starting
   * the fall above that widest point rather than on it.
   *
   * Nothing here is a function of the trigger's *width*: the arc is pinned to
   * that edge with `left-full`, so a longer selection moves the whole thing
   * right and changes none of it.
   */
  const flareDrop =
    FLARE_RADIUS * Math.max(0, (PANEL_TOP - FLARE_START) * trigger.height);
  const flareRun = flareDrop * FLARE_RUN;

  /**
   * How far the fill reaches up behind the trigger. The panel's top is above
   * the trigger's bottom, so the fill has to be that much taller than the rows
   * or it would run out from under them before they end.
   */
  const tuckUp = (1 - PANEL_TOP) * trigger.height;

  /**
   * The arc has to come down onto the flat of the panel's top edge, clear of
   * the panel's own rounded corner — so however short OVERHANG is set, the
   * panel still has to clear the trigger by at least the two of them together.
   * Laying the arc out flat is what makes this bite: its reach grows with
   * FLARE_RUN while the room it needs to land in does not.
   */
  const overhang = Math.max(OVERHANG, flareRun + RADIUS);
  const panelWidth = Math.max(PANEL_MIN_W, trigger.width + overhang);

  /**
   * What the trigger can actually carry, which is not always what RADIUS asks
   * for. Two corners sharing an edge cannot take more than that edge is long,
   * and rather than refuse, the browser silently scales *every* corner of the
   * box down until they fit — by a different factor per state, because open
   * the bottom two are 0 and stop competing for the trigger's height. That is
   * the whole reason the top corners appear to grow the moment it is clicked:
   * nobody animates them, they were being held down while closed and are let
   * go on open. Capped to something the box can hold in both states, the
   * trigger keeps one silhouette throughout.
   *
   * The panel is not capped — it is big enough to take RADIUS whole, which is
   * what keeps the constant meaningful past the trigger's own ceiling.
   */
  const triggerRadius = trigger.height
    ? Math.min(RADIUS, trigger.height / 2, trigger.width / 2)
    : RADIUS;

  /**
   * Closed, the panel is not a flat edge parked under the trigger — it *is*
   * the trigger: same width, same height, same corners, stowed directly behind
   * it. Opening walks it out and down; closing walks it back in.
   *
   * That is what takes the line out of the retraction. A pill's bottom edge is
   * only flat between its corners, so a panel that ends as a two-pixel strip
   * of the trigger's full width overhangs that curve by a whole radius on each
   * side — and two pixels of height is exactly what it has left at the moment
   * the corners have finished rounding. Ending as the trigger's own shape,
   * there is no last strip left to overhang anything.
   *
   * Stowed, it is written in percentages of the trigger rather than in the
   * measured copy of the same numbers. They resolve to the identical box —
   * the shape layer is `inset-0` — but they resolve to it on the *first*
   * paint, with nothing to correct afterwards. Held in pixels, the closed
   * panel is 0×0 until a reading lands, a radius on a 0×0 box is clamped to 0,
   * and every reading after that (a web font swapping in and retyping the
   * selection is the reliable one) drags the shape along behind it.
   */
  const panelFill = {
    top: open ? `${PANEL_TOP * 100}%` : 0,
    width: open ? panelWidth : "100%",
    height: open ? panelHeight + tuckUp : "100%",
  };

  /**
   * The content's window. Its lower edge has to sit exactly on the fill's, or
   * rows are uncovered past the shape that is meant to be carrying them — and
   * it does, at every point of the way, because the fill's top and height are
   * read from the same progress: `trigger.height + panelHeight × p` falls out
   * of both. Giving either one a timing of its own is what would break it.
   */
  const panelClip = {
    width: panelFill.width,
    height: open ? panelHeight : 0,
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {/* Shape layer. Kept free of text so the outline filter traces only the
          silhouette and never haloes the content. The fills touch, so the
          filter sees their union and draws no rim along the seams.

          Painted back to front: the panel first, the trigger last. While the
          panel is stowed it is the trigger's exact shape and the trigger is
          drawn straight over it, so the body keeps one crisp silhouette
          instead of two identical ones fighting over the same edge. */}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-20", s.outline)}
      >
        {/* Panel. Closed it wears the trigger's own corners, because closed it
            is the trigger. On the way out the top left runs flat into the left
            edge, and the top right opens up as the panel clears the trigger —
            held at RADIUS from the start it would cut a notch in under the
            trigger's corner, back when the two are still the same width and
            that edge has to read as one straight line. */}
        <span
          className={cn(
            "absolute left-0",
            ready && "transition-[top,width,height,border-radius]",
            GROW,
            s.fill,
          )}
          style={{
            ...panelFill,
            borderRadius: open
              ? `0 ${RADIUS}px ${RADIUS}px ${RADIUS}px`
              : `${triggerRadius}px`,
          }}
        />

        {/* Trigger. Its bottom corners open out flat once the panel has taken
            that edge over, and come back once it gives it up. Both are instant
            — a duration would only draw the eye to a corner that is supposed to
            go unnoticed — so the whole job is choosing the moment.

            Opening, the corners cannot go on the click. This span paints last,
            over the panel, so square corners here are square on screen no
            matter what is behind them, and at that point the panel is still
            stowed at exactly the trigger's shape with nothing to sell them as
            part of a larger body. 60ms buys a window instead: GROW is a hard
            ease-out, so by then the panel is about 70% out — already wider than
            the trigger, and its top still above where these corners begin, so
            it is backing every pixel the squaring adds. The change lands
            covered. Much later and the panel's top drops past them and the
            cover is gone; much earlier and there is nothing behind them yet.

            Closing, they overlap the retraction rather than queue behind it.
            Waiting for the panel to be gone is what makes them read as a
            glitch: they arrive late, with nothing else moving, so the eye has
            only them to look at. The 80ms head start is the panel's — by then
            it has pulled most of the way back under here — and ease-in-out
            spends the rest where it is safe: slow while there is still panel
            showing, quick once there is not. Done by 230ms, comfortably inside
            GROW's 280. */}
        <span
          className={cn("absolute inset-0", s.fill)}
          style={{
            borderRadius: open
              ? `${triggerRadius}px ${triggerRadius}px 0 0`
              : `${triggerRadius}px`,
            transition: !ready
              ? "none"
              : open
                ? "border-radius 0s linear 60ms"
                : "border-radius 150ms ease-in-out 80ms",
          }}
        />

        {/* The concave corner, drawn as it grows. `left-full` is the whole
            adaptivity story: it is the trigger's right edge whatever the
            selection does, and at FLARE_START — the middle — that edge is at
            its full width with a vertical tangent, so the arc leaves it
            flush. */}
        <span
          className={cn(
            "absolute left-full transition-[width,height]",
            GROW,
            s.fill,
          )}
          style={{
            bottom: `${(1 - PANEL_TOP) * 100}%`,
            width: open ? flareRun : 0,
            height: open ? flareDrop : 0,
            maskImage: FLARE_MASK,
            WebkitMaskImage: FLARE_MASK,
          }}
        />
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          "relative z-30 inline-flex h-10 min-w-40 cursor-pointer items-center gap-2 px-4 text-sm font-medium",
          s.trigger,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selected?.label ?? placeholder}
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

      {/* The opening itself: it grows on the same curve as the fill behind it
          and clips whatever has not come out yet. */}
      <div
        aria-hidden={!open}
        inert={!open}
        data-state={open ? "open" : "closed"}
        style={panelClip}
        className={cn(
          "absolute left-0 top-full z-30 overflow-hidden",
          ready && "transition-[width,height]",
          GROW,
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Held at the panel's full width so the rows lay out once and stay
            put — nothing reflows while the box travels over them.

            The block itself rides down from inside the trigger on the same
            curve as the box, a little behind its lower edge. That is what
            makes the rows look extruded rather than uncovered, and it is why
            nothing can appear outside the silhouette early: the clip is only
            ever as tall as the fill behind it. */}
        <div
          ref={panelRef}
          id={contentId}
          role="listbox"
          aria-label={`${label} options`}
          className={cn("flex flex-col gap-1 transition-transform", GROW)}
          style={{
            padding: PANEL_PAD,
            width: panelWidth,
            transform: open ? "translateY(0)" : `translateY(-${TUCK}px)`,
          }}
        >
          {options.map((option, index) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                aria-disabled={option.disabled || undefined}
                disabled={option.disabled}
                onClick={() => {
                  setValue(option.value);
                  onValueChange?.(option.value);
                  close();
                }}
                // Only the fade is staggered: the block carries the motion, and
                // a second travel per row would pull against it.
                //
                // Opacity is a style rather than a class because a disabled row
                // has to dim *and* obey the reveal. As two Tailwind classes
                // they would be the same property at the same specificity, and
                // which one won would come down to stylesheet order.
                style={{
                  borderRadius: ITEM_RADIUS,
                  opacity: open ? (option.disabled ? 0.4 : 1) : 0,
                  transitionDelay: open ? `${40 + index * 35}ms` : "0ms",
                }}
                className={cn(
                  "flex h-9 w-full cursor-pointer items-center gap-2.5 px-2.5 text-left text-[13px]",
                  "transition-[color,background-color,opacity] duration-200 ease-out",
                  active ? s.itemActive : s.item,
                  option.disabled && "pointer-events-none",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {active ? (
                  <Check
                    size={15}
                    weight="Outline"
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
