import type { CSSProperties } from "react";

/**
 * ────────────────────────────────────────────────────────────────
 *  THE CONCAVE RAILS — where a full-bleed section meets the page column.
 *
 *  The line arrives flat from both screen edges, turns through a quarter
 *  circle and lands on the column's rails, which carry straight on into the
 *  block beyond. `edge` says which way it turns: "bottom" closes a section off
 *  underneath (the hero), "top" opens one up from above (the work band, which
 *  uses both and so is bounded by the column at each end and by nothing in
 *  between).
 *
 *  Drawn as two boxes rather than an SVG path, because a box with a top
 *  border, a side border and one rounded corner already IS this shape. The
 *  browser puts the tangent between the straight run and the arc exactly where
 *  it belongs at any width, and the stroke stays a hairline without any
 *  scaling maths of its own.
 *
 *  Each box spans the gutter between a screen edge and its rail, so when the
 *  viewport narrows to the column the gutter closes on its own: the arc has
 *  nowhere left to go and what remains is the bare rail, which is the right
 *  drawing at that width. Nothing to switch off.
 *
 *  This is also why a section using one is rendered OUTSIDE `<Frame>` — the
 *  flat run has to reach the screen edge, which it cannot do from inside a
 *  1200px column.
 *
 *  The two boxes are filled with the page colour as well as outlined, which is
 *  what keeps a section's background inside its own edge: everything past the
 *  curve belongs to the next block, and a background painted across the whole
 *  band would otherwise run straight through it. The fill is clipped by the
 *  same radius that draws the arc, so the cover and the line can never
 *  disagree about where the corner is.
 * ────────────────────────────────────────────────────────────────
 */

/** The page column, straight off `<Frame>`. Has to stay in step with it. */
const COLUMN = 1200;

/**
 * The shape, shared by every curve on the page — the hero's and both of the
 * work band's. They only read as the same gesture if they are the same size,
 * so this is the one place either number is set. A block that hands its own
 * height to a curve (`rise="100%"`) should be sized off `CONCAVE.rise` too, so
 * it stays in the set.
 */
export const CONCAVE = {
  /**
   * How far in from its edge the flat part of the line sits, which is also how
   * long the rail's run into the next block is. Any CSS length: px pins it, a
   * percentage follows the height of the section it is in — but px is what
   * keeps three curves in different-sized sections identical.
   */
  rise: "100%",
  /**
   * The corner. In px it is a true quarter circle; as a percentage it is an
   * ellipse that always spans the whole gutter, so the sweep keeps its shape
   * at every width. Either way the browser clamps it to what the box can
   * fit — it can never overshoot into the column.
   */
  radius: "0%",
};

/**
 * Each half stops one pixel inside the column edge: its rail is a border, and
 * that border has to land on the same pixel `<Frame>` draws its own on, or the
 * line jogs sideways where the two meet.
 */
const RAIL = COLUMN / 2 - 1;

export function ConcaveRails({
  edge = "bottom",
  mode = "overlay",
  rise = CONCAVE.rise,
  radius = CONCAVE.radius,
  className = "",
}: {
  /** Which edge of the full-bleed area the line closes, and so which way it turns. */
  edge?: "top" | "bottom";
  /**
   * "overlay" pins it over that edge of the section it sits in, taking no
   * height of its own — the hero, where it has to cover a background.
   * "strip" makes it a block between two sections instead, so the full-bleed
   * one on the other side of it stays completely clear. A strip owns its
   * height, so give that one a real length rather than a percentage.
   */
  mode?: "overlay" | "strip";
  /** Per-section overrides. Left alone, both come off CONCAVE above. */
  rise?: string;
  radius?: string;
  className?: string;
}) {
  // The whole flip is which border carries the flat run and which corner is
  // rounded; the rails, the gutters and the fill are the same either way.
  const opening = edge === "top";
  const run = opening ? "border-b" : "border-t";
  const place =
    mode === "strip"
      ? "relative w-full"
      : `absolute inset-x-0 z-[6] ${opening ? "top-0" : "bottom-0"}`;

  const left: CSSProperties = {
    right: `calc(50% + ${RAIL}px)`,
    ...(opening
      ? { borderBottomRightRadius: radius }
      : { borderTopRightRadius: radius }),
  };

  const right: CSSProperties = {
    left: `calc(50% + ${RAIL}px)`,
    ...(opening
      ? { borderBottomLeftRadius: radius }
      : { borderTopLeftRadius: radius }),
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none hidden lg:block ${place} ${className}`.trim()}
      style={{ height: rise }}
    >
      <div
        className={`absolute inset-y-0 left-0 border-r border-border bg-background ${run}`}
        style={left}
      />
      <div
        className={`absolute inset-y-0 right-0 border-l border-border bg-background ${run}`}
        style={right}
      />
    </div>
  );
}
