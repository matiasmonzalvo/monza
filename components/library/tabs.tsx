"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type TabsVersion = "border" | "solid" | "blur";

export type TabItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * ────────────────────────────────────────────────────────────────
 *  SHAPE — the dropdown's, down to the constants.
 *
 *  A strip on its own has no concave corner to give: it is one box,
 *  and every corner points outward. The title earns it. Set at the
 *  top left and narrower than the bar, it leaves the left edge one
 *  straight line top to bottom and puts the only inside corner on its
 *  right, where its side turns into the bar's top — the dropdown's
 *  joint exactly, and the only kind an arc can turn back on itself in.
 *
 *  So the title *is* that trigger and the bar is its panel. Which is a
 *  claim about one thing above all: the bar's top edge does not sit
 *  under the title, it crosses it, and the title's own fill covers the
 *  overlap. The two read as one body rather than a plaque resting on a
 *  strip.
 *
 *  What is not carried over is the motion, and that is what lets the
 *  tabs sit closer to the title than the dropdown's items sit to its
 *  label. The dropdown writes this shape as fractions of its trigger
 *  because the trigger has to stay one clickable box while the panel
 *  slides out from behind it — its items cannot start any higher than
 *  that box's bottom edge, sixteen pixels below the line the shape
 *  actually breaks on. Nothing here slides. So the same silhouette is
 *  written in plain pixels, and the two lines are two numbers.
 *
 *  RADIUS   convex radius, on every corner of that silhouette but one, and
 *           the ceiling the title's corner grows into. A ceiling rather than a
 *           promise: the browser scales any corner down to fit the edge it
 *           sits on.
 *  TITLE_H  ← the knob. The title band's height, which is where the tabs
 *           start. Turn this one number to bring them nearer the label or
 *           push them away; every corner below is derived and follows on its
 *           own.
 *  TUCK     how far the bar's top edge climbs up inside the band. Those last
 *           pixels of the title are swallowed whole — the bar spans the full
 *           width, so there is nothing of them left to see — and that is the
 *           point: it puts the line the shape breaks on above the line the
 *           content starts on, and the two stop being the same number.
 *  FLARE_GAP the straight run of title edge left between the end of its corner
 *           and the bar's line. The arc has to leave that edge on a vertical,
 *           and an edge is only vertical below its corner, so this is at once
 *           the room the arc gets and what the corner is capped against.
 *  FLARE_RADIUS how much rounder than that run the arc is allowed to be. The
 *           fall *is* the arc's vertical radius — a curve tangent to a vertical
 *           edge at one end and a horizontal one at the other has no radius to
 *           spare — so the only way to round it further is to let it start up
 *           inside the corner. That gives up the flush join, and ARC_INSET
 *           below pays for it rather than forbidding it.
 *  FLARE_RUN how far the arc then runs out, as a multiple of that fall. 1 is a
 *           circle, turning in a quarter of its own width; above that the
 *           ellipse lies on its side — a short drop off the title and a long,
 *           shallow run out.
 *
 *  At 28 and 4 the bar's line, the title's cap and the arc all land
 *  exactly where the dropdown puts them. The only thing that moved is
 *  the tabs, up by twelve.
 * ────────────────────────────────────────────────────────────────
 */
const RADIUS = 24;
const TITLE_H = 28;
const TUCK = 4;
const FLARE_GAP = 4;
const FLARE_RADIUS = 1.25;
const FLARE_RUN = 1;

/**
 * Where the bar's top edge lands — the line the whole silhouette breaks on,
 * and the only one of these numbers you actually see. Above it there is title;
 * below it the bar runs the full width, so the band's last TUCK pixels are
 * inside the bar with nothing left of them to look at.
 *
 * That invisibility is what is being bought. The tabs start at TITLE_H, the
 * shape breaks at BAR_TOP, and TUCK is the distance between the two — which is
 * how the content comes up without the silhouette moving at all.
 */
const BAR_TOP = Math.max(0, TITLE_H - TUCK);

/**
 * The bar's inner padding, and the indicator radius that follows from it.
 *
 * Corners nest by *subtracting the gap between them*. An inner box that is to
 * keep the same distance from an outer one the whole way round a corner has to
 * be exactly that much less round — hold both at the same radius and the two
 * curves converge on the diagonal, so the gap pinches shut at 45° and gapes on
 * the straights. RADIUS − BAR_PAD is the one value that keeps it even, which
 * is why the indicator is not a number of its own: move the component's radius
 * and it follows.
 *
 * The padding is a number rather than a `p-1` because three things read it —
 * the bar, the indicator's inset, and the width it splits between the tabs —
 * and spelling it three times is how they drift apart.
 *
 * 6 is the dropdown's panel padding, and a tab row is `h-9` against its `h-9`
 * item, so the indicator sits in the bar exactly as a menu row sits in the
 * panel. At 18 it renders as a full pill — that is the browser refusing a
 * radius taller than half the box, not a bug.
 */
const BAR_PAD = 6;
const ITEM_RADIUS = Math.max(0, RADIUS - BAR_PAD);

/**
 * What the title can actually carry. Its bottom corners are square, so its
 * left edge is not competing with anything and the band's height is not the
 * ceiling — the bar's line is, less the straight run the arc has to leave on.
 * Round it past that and the corner would still be turning where the arc needs
 * to meet it vertically, and the join would show a kink instead of nothing.
 *
 * So it grows into RADIUS and stops there. At TITLE_H 28 that leaves 20, the
 * dropdown's trigger cap to the pixel; give the band another six and the title
 * reaches RADIUS itself, and every convex corner in the component is one
 * number.
 *
 * The trigger caps against its width too, having measured it. Nothing here is
 * measured, and nothing needs to be: TITLE_PAD alone puts 2 × 16px on the band
 * before the label is even set, which is within a rounding error of the
 * 2 × TITLE_RADIUS the corners want. No label takes it below that.
 */
const TITLE_RADIUS = Math.max(0, Math.min(RADIUS, BAR_TOP - FLARE_GAP));

/**
 * The arc, and the nudge that keeps it attached to the title.
 *
 * Nothing in it is a function of the title's *width*: it is pinned to that
 * edge with `left-full`, so a longer label moves the whole thing right and
 * changes none of it.
 *
 * The nudge is what FLARE_RADIUS costs. Buying more curve means starting the
 * fall up inside the title's corner, and up there its edge has already curved
 * back in by r − √(r² − d²) — so the arc slides left by exactly as much and
 * lands on the curve instead of hanging in the air beside it. The two then
 * overlap a little below the join, which costs nothing: same fill, and an
 * overlap is invisible where a gap would be a hole.
 *
 * At 1.25 the bite is a fortieth of a pixel and this is doing nothing. It is
 * here so the constant can be pushed without the arc detaching.
 *
 * The fall is held to FLARE_GAP because that is all the straight edge there
 * is. Only a band tall enough to cap the corner at RADIUS leaves more, and
 * letting the arc take it would grow the flare every time the band grew —
 * which is a corner detail turning into a swoop for no reason anyone asked.
 */
const ARC_DROP =
  FLARE_RADIUS * Math.min(FLARE_GAP, Math.max(0, BAR_TOP - TITLE_RADIUS));
const ARC_RUN = ARC_DROP * FLARE_RUN;
const ARC_INTO = Math.max(0, TITLE_RADIUS - (BAR_TOP - ARC_DROP));
const ARC_INSET =
  TITLE_RADIUS - Math.sqrt(Math.max(0, TITLE_RADIUS ** 2 - ARC_INTO ** 2));

/**
 * The room the arc needs to the right of the title: its own run, and then the
 * bar's corner, which it has to come down clear of. The dropdown holds its
 * panel to this as a minimum width; here the bar is the whole box, so the
 * title row carries it as padding instead — the box can then never be narrower
 * than the shape needs, however long the label runs.
 */
const ARC_CLEAR = ARC_RUN + RADIUS;

/**
 * Carves the concave corner. A box sits in the notch at the title's bottom
 * right and a quarter ellipse pinned to that box's *outer* corner is masked
 * away; the arc left behind meets the title's side vertically at one end and
 * the bar's top horizontally at the other.
 *
 * Both radii are 100%, so the ellipse is whatever shape the box is — which is
 * what FLARE_RUN steers.
 */
const FLARE_MASK =
  "radial-gradient(ellipse 100% 100% at 100% 0%, transparent calc(100% - 0.5px), #000 100%)";

/**
 * The title's box, spelled once. It is written twice into the DOM — the text
 * you read, and an invisible copy inside the shape layer — so that the fill
 * can be exactly the title's width without measuring it. Held apart, the two
 * would drift and the arc would land off the title's side.
 *
 * The padding is a number rather than a `px-*` because the width it sets is
 * what the arc is pinned to, and 16 is the trigger's `px-4`.
 */
const TITLE_PAD = 16;
const TITLE_BOX =
  "flex items-center justify-center whitespace-nowrap text-[13px] font-medium tracking-tight";

/**
 * The band is TITLE_H tall but only BAR_TOP of it is on show, so the padding
 * at its foot is the difference: it centres the label in the part you can see
 * rather than in the part the bar has taken. Turn TUCK and the label holds its
 * place instead of drifting down with the band.
 */
const TITLE_STYLE = {
  height: TITLE_H,
  paddingInline: TITLE_PAD,
  paddingBottom: TITLE_H - BAR_TOP,
};

/**
 * Indicator travel time. The blur is held for exactly this long, so the
 * `duration-[320ms]` classes below and this number have to move together.
 */
const MOVE_MS = 320;

/**
 * ────────────────────────────────────────────────────────────────
 *  VERSIONS
 *  Only the fill changes — background, backdrop and outline. The
 *  silhouette above is identical in all of them.
 * ────────────────────────────────────────────────────────────────
 */
const STYLES = {
  border: {
    fill: "bg-background",
    // Traces a 1px rim around the whole silhouette, the concave arcs included.
    outline:
      "[filter:drop-shadow(0_1px_0_var(--border))_drop-shadow(0_-1px_0_var(--border))_drop-shadow(1px_0_0_var(--border))_drop-shadow(-1px_0_0_var(--border))]",
    title: "text-foreground",
    indicator: "bg-surface-2",
    tab: "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
    tabActive: "text-foreground",
  },
  solid: {
    fill: "bg-muted",
    outline: "",
    title: "text-foreground",
    indicator: "bg-foreground/20",
    tab: "text-foreground/60 hover:text-foreground focus-visible:text-foreground",
    tabActive: "text-foreground",
  },
  // Both schemes are spelled out. A lone `bg-*` here would be overruled in
  // the dark scheme: `dark:` carries no extra specificity, it just sorts
  // later, so the pair has to be set together or not at all.
  blur: {
    fill: "bg-neutral-200/70 backdrop-blur-xl backdrop-saturate-150 dark:bg-neutral-800/70",
    outline: "",
    title: "text-foreground",
    indicator: "bg-white/75 dark:bg-white/15",
    tab: "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
    tabActive: "text-foreground",
  },
} satisfies Record<TabsVersion, Record<string, string>>;

const DEFAULT_ITEMS: TabItem[] = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" },
];

/**
 * A titled tab strip. Tabs share the width evenly, which is what lets the
 * indicator be placed with plain percentages — no measuring, so it lands right
 * on the first paint instead of snapping into place after hydration.
 *
 * Selecting another tab pulls focus onto it: the indicator slides and smears,
 * and every other label blurs through the move. The tab you picked is the one
 * thing that never goes soft, so the eye lands on it. That is also the only
 * thing here that moves — the silhouette never does.
 *
 * This is the strip on its own. Panels are the caller's: point each tab at one
 * with `aria-controls` if you wire them up.
 */
export function Tabs({
  version = "border",
  label = "Tabs List Header",
  items = DEFAULT_ITEMS,
  defaultValue,
  onValueChange,
  className,
}: {
  version?: TabsVersion;
  /** Printed in the title band, and the strip's accessible name. */
  label?: string;
  items?: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const s = STYLES[version];
  const titleId = useId();
  const reduced = useReducedMotion();
  const [value, setValue] = useState(defaultValue ?? items[0]?.value ?? "");
  const [moving, setMoving] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // An unknown `defaultValue` leaves no tab selected; the indicator still has
  // to park somewhere, so it parks on the first.
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function select(next: string) {
    if (next === value) return;

    setValue(next);
    onValueChange?.(next);

    if (reduced) return;
    setMoving(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMoving(false), MOVE_MS);
  }

  /** Walks `step` tabs at a time from `from`, wrapping, skipping disabled. */
  function nextEnabled(from: number, step: number) {
    const count = items.length;

    for (let hop = 1; hop <= count; hop += 1) {
      const index = (((from + step * hop) % count) + count) % count;
      if (!items[index].disabled) return index;
    }
    return from;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target =
      event.key === "ArrowRight"
        ? nextEnabled(activeIndex, 1)
        : event.key === "ArrowLeft"
          ? nextEnabled(activeIndex, -1)
          : event.key === "Home"
            ? nextEnabled(-1, 1)
            : event.key === "End"
              ? nextEnabled(0, -1)
              : null;

    if (target === null) return;
    event.preventDefault();
    select(items[target].value);
    tabRefs.current[target]?.focus();
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Shape layer. Kept free of text so the outline filter traces only the
          silhouette and never haloes the content. Bar, title and arc touch, so
          the filter sees their union and draws no rim along the seams — which
          is what makes the whole thing read as one body rather than a plaque
          sitting on a strip.

          Painted back to front, the dropdown's order: the bar first, the title
          last. They overlap by design now, and the title has to be the one on
          top — it is the trigger, and a trigger is never covered by its own
          panel. */}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-10", s.outline)}
      >
        {/* The bar. Its top edge crosses the title rather than meeting it, and
            its top left stays square — that edge runs straight on up into the
            title's, with nothing to round. No radius cap: nothing about this
            box changes between states, so the browser scaling the corners down
            to fit is a one-off it does before the first paint. */}
        <span
          className={cn("absolute inset-x-0 bottom-0", s.fill)}
          style={{
            top: BAR_TOP,
            borderRadius: `0 ${RADIUS}px ${RADIUS}px ${RADIUS}px`,
          }}
        />

        {/* The title, and the arc hanging off its lower right. The wrapper
            carries no fill of its own — it is only a frame — so the arc can
            sit outside its edge without being nested inside a painted box,
            which in the blur version would tint it twice. */}
        <span className="absolute left-0 top-0">
          {/* Sets the width. Never seen, never read — but it is what lets the
              fill be exactly the title's size on the first paint, with no
              measurement to arrive late and drag the shape after it. */}
          <span
            aria-hidden="true"
            className={cn("invisible", TITLE_BOX)}
            style={TITLE_STYLE}
          >
            {label}
          </span>

          {/* The trigger's shape: a pill's top half, squared off along the
              bottom where the bar has taken that edge over. It runs the band's
              full height, past where the bar begins, so it is what covers the
              overlap. */}
          <span
            className={cn("absolute inset-0", s.fill)}
            style={{
              borderRadius: `${TITLE_RADIUS}px ${TITLE_RADIUS}px 0 0`,
            }}
          />

          {/* The concave corner. `left-full` is the whole adaptivity story: it
              is the title's right edge whatever the label does, and below the
              corner that edge is at its full width with a vertical tangent, so
              the arc leaves it flush. Its bottom is measured off BAR_TOP, the
              same number the bar's own top is, so the two cannot land on
              different lines. */}
          <span
            className={cn("absolute left-full", s.fill)}
            style={{
              bottom: TITLE_H - BAR_TOP,
              width: ARC_RUN,
              height: ARC_DROP,
              marginLeft: -ARC_INSET,
              maskImage: FLARE_MASK,
              WebkitMaskImage: FLARE_MASK,
            }}
          />
        </span>
      </div>

      {/* Title. The same box as the sizer above, which is why both read their
          padding and type from TITLE_BOX and TITLE_STYLE — centred in the part
          of the band that shows, since its last TUCK pixels are inside the bar.

          The padding on the row is the arc's landing room. It is the one thing
          holding the box wider than the title, and so the only reason a long
          label cannot eat the concave corner. */}
      <div className="relative z-20 flex" style={{ paddingRight: ARC_CLEAR }}>
        <span
          id={titleId}
          className={cn(TITLE_BOX, s.title)}
          style={TITLE_STYLE}
        >
          {label}
        </span>
      </div>

      <div
        role="tablist"
        aria-labelledby={titleId}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        // No `gap`: each column has to be exactly a third (or an n-th) of the
        // track, or the indicator's `translateX` steps would drift off the tabs.
        style={{
          padding: BAR_PAD,
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
        className="relative z-20 grid"
      >
        <span
          aria-hidden="true"
          // Width is the track — the box less its padding on both sides — split
          // evenly, so one step of its own width is one tab.
          style={{
            top: BAR_PAD,
            bottom: BAR_PAD,
            left: BAR_PAD,
            width: `calc((100% - ${BAR_PAD * 2}px) / ${items.length})`,
            borderRadius: ITEM_RADIUS,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          className={cn(
            "pointer-events-none absolute will-change-[transform,filter]",
            !reduced &&
              "transition-[transform,filter] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            moving && "blur-[3px]",
            s.indicator,
          )}
        />

        {items.map((item, index) => {
          const active = index === activeIndex;
          // Everything except the tab being lit pulls out of focus.
          const shifting = moving && !active;

          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={active ? 0 : -1}
              onClick={() => select(item.value)}
              className={cn(
                "relative z-10 flex h-9 cursor-pointer items-center justify-center px-4",
                "text-[13px] font-medium transition-colors duration-200",
                active ? s.tabActive : s.tab,
                item.disabled && "pointer-events-none opacity-40",
              )}
            >
              <span
                className={cn(
                  "truncate",
                  !reduced &&
                    "transition-[filter] duration-[320ms] ease-out will-change-[filter]",
                  shifting && "blur-[2px]",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
