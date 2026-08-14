"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type InputVersion = "border" | "solid";

/**
 * ────────────────────────────────────────────────────────────────
 *  SHAPE — the dropdown's, down to the constants.
 *
 *  A field on its own has no concave corner to give: it is one box,
 *  and every corner points outward. The label plaque earns it. Set at
 *  the top left and narrower than the body, it leaves the left edge
 *  one straight line top to bottom and puts the only inside corner on
 *  its right, where its side turns into the body's top.
 *
 *  So the plaque *is* that trigger and the body is its panel. Which is
 *  a claim about one thing above all: the body's top edge does not sit
 *  under the plaque, it crosses it, and the plaque's own fill covers
 *  the overlap. The two read as one body rather than a badge resting
 *  on a field.
 *
 *  What is not carried over is the motion, and that is what lets the
 *  field sit closer to the label than the dropdown's items sit to its
 *  own. The dropdown writes this shape as fractions of its trigger
 *  because the trigger has to stay one clickable box while the panel
 *  slides out from behind it — its items cannot start any higher than
 *  that box's bottom edge, sixteen pixels below the line the shape
 *  actually breaks on. Nothing here slides. So the same silhouette is
 *  written in plain pixels, and the two lines are two numbers.
 *
 *  RADIUS   convex radius, on every corner of that silhouette but one, and
 *           the ceiling the plaque's corner grows into. A ceiling rather than
 *           a promise: the browser scales any corner down to fit the edge it
 *           sits on.
 *  TITLE_H  ← the knob. The plaque's height, which is where the field starts.
 *           Turn this one number to bring it nearer the label or push it
 *           away; every corner below is derived and follows on its own.
 *  TUCK     how far the body's top edge climbs up inside the plaque. Those
 *           last pixels of it are swallowed whole — the body spans the full
 *           width, so there is nothing of them left to see — and that is the
 *           point: it puts the line the shape breaks on above the line the
 *           content starts on, and the two stop being the same number.
 *  FLARE_GAP the straight run of plaque edge left between the end of its
 *           corner and the body's line. The arc has to leave that edge on a
 *           vertical, and an edge is only vertical below its corner, so this
 *           is at once the room the arc gets and what the corner is capped
 *           against.
 *  FLARE_RADIUS how much rounder than that run the arc is allowed to be. The
 *           fall *is* the arc's vertical radius — a curve tangent to a vertical
 *           edge at one end and a horizontal one at the other has no radius to
 *           spare — so the only way to round it further is to let it start up
 *           inside the corner. That gives up the flush join, and ARC_INSET
 *           below pays for it rather than forbidding it.
 *  FLARE_RUN how far the arc then runs out, as a multiple of that fall. 1 is a
 *           circle, turning in a quarter of its own width; above that the
 *           ellipse lies on its side — a short drop off the plaque and a long,
 *           shallow run out.
 *
 *  At 28 and 4 the body's line, the plaque's cap and the arc all land
 *  exactly where the dropdown puts them. The only thing that moved is
 *  the field, up by twelve.
 * ────────────────────────────────────────────────────────────────
 */
const RADIUS = 24;
const TITLE_H = 28;
const TUCK = 4;
const FLARE_GAP = 4;
const FLARE_RADIUS = 1.25;
const FLARE_RUN = 1;

/**
 * Where the body's top edge lands — the line the whole silhouette breaks on,
 * and the only one of these numbers you actually see. Above it there is
 * plaque; below it the body runs the full width, so the plaque's last TUCK
 * pixels are inside it with nothing left of them to look at.
 *
 * That invisibility is what is being bought. The field starts at TITLE_H, the
 * shape breaks at BODY_TOP, and TUCK is the distance between the two — which
 * is how the content comes up without the silhouette moving at all.
 */
const BODY_TOP = Math.max(0, TITLE_H - TUCK);

/**
 * The plaque's box, spelled once. It goes into the DOM twice — the label you
 * read, and an invisible copy inside the shape layer — so the fill can be
 * exactly the label's width without measuring it. Type metrics are not
 * arithmetic: how wide "Email" comes out depends on the font, and a font that
 * swaps in late would drag a measured shape along behind it. A second copy
 * laying out under the same rules is right on the first paint and stays right.
 *
 * Held apart, the two would drift and the arc would land off the plaque's side,
 * which is why the padding is a number here rather than a `px-*` on each: the
 * field's own padding is derived from it further down, and 16 is the trigger's
 * `px-4`.
 */
const TITLE_PAD = 16;
const TITLE_BOX =
  "flex items-center justify-center whitespace-nowrap text-[13px] font-medium tracking-tight";

/**
 * The plaque is TITLE_H tall but only BODY_TOP of it is on show, so the
 * padding at its foot is the difference: it centres the label in the part you
 * can see rather than in the part the body has taken. Turn TUCK and the label
 * holds its place instead of drifting down with the plaque.
 */
const TITLE_STYLE = {
  height: TITLE_H,
  paddingInline: TITLE_PAD,
  paddingBottom: TITLE_H - BODY_TOP,
};

/**
 * The body's inner padding, and the field radius that follows from it.
 *
 * Corners nest by *subtracting the gap between them*. An inner box that is to
 * keep the same distance from an outer one the whole way round a corner has to
 * be exactly that much less round — hold both at the same radius and the two
 * curves converge on the diagonal, so the gap pinches shut at 45° and gapes on
 * the straights. RADIUS − BODY_PAD is the one value that keeps it even.
 *
 * 6 is the dropdown's panel padding, and the field is `h-9` against its `h-9`
 * row, so the field sits in the body exactly as a menu row sits in the panel.
 * At 18 it renders as a full pill — that is the browser refusing a radius
 * taller than half the box, not a bug.
 */
const BODY_PAD = 6;
const FIELD_RADIUS = Math.max(0, RADIUS - BODY_PAD);

/**
 * The field's own padding, derived so its text starts on the same vertical as
 * the label above it: BODY_PAD + FIELD_PAD lands exactly on TITLE_PAD. Written
 * as a number it would only be right until one of the other two moved.
 */
const FIELD_PAD = Math.max(0, TITLE_PAD - BODY_PAD);

/** The body is a field, not a label — it needs room to be typed into. */
const MIN_W = 320;

/**
 * What the plaque can actually carry. Its bottom corners are square, so its
 * left edge is not competing with anything and the plaque's height is not the
 * ceiling — the body's line is, less the straight run the arc has to leave on.
 * Round it past that and the corner would still be turning where the arc needs
 * to meet it vertically, and the join would show a kink instead of nothing.
 *
 * So it grows into RADIUS and stops there. At TITLE_H 28 that leaves 20, the
 * dropdown's trigger cap to the pixel; give the plaque another six and it
 * reaches RADIUS itself, and every convex corner in the component is one
 * number.
 *
 * The trigger caps against its width too, having measured it. Nothing here is
 * measured, and nothing needs to be: TITLE_PAD alone puts 2 × 16px on the
 * plaque before the label is even set, which is within a rounding error of the
 * 2 × TITLE_RADIUS the corners want. No label takes it below that.
 */
const TITLE_RADIUS = Math.max(0, Math.min(RADIUS, BODY_TOP - FLARE_GAP));

/**
 * The arc, and the nudge that keeps it attached to the plaque.
 *
 * Nothing in it is a function of the plaque's *width*: it is pinned to that
 * edge with `left-full`, so a longer label moves the whole thing right and
 * changes none of it.
 *
 * The nudge is what FLARE_RADIUS costs. Buying more curve means starting the
 * fall up inside the plaque's corner, and up there its edge has already curved
 * back in by r − √(r² − d²) — so the arc slides left by exactly as much and
 * lands on the curve instead of hanging in the air beside it. The two then
 * overlap a little below the join, which costs nothing: same fill, and an
 * overlap is invisible where a gap would be a hole.
 *
 * At 1.25 the bite is a fortieth of a pixel and this is doing nothing. It is
 * here so the constant can be pushed without the arc detaching.
 *
 * The fall is held to FLARE_GAP because that is all the straight edge there
 * is. Only a plaque tall enough to cap the corner at RADIUS leaves more, and
 * letting the arc take it would grow the flare every time the plaque grew —
 * which is a corner detail turning into a swoop for no reason anyone asked.
 */
const ARC_DROP =
  FLARE_RADIUS * Math.min(FLARE_GAP, Math.max(0, BODY_TOP - TITLE_RADIUS));
const ARC_RUN = ARC_DROP * FLARE_RUN;
const ARC_INTO = Math.max(0, TITLE_RADIUS - (BODY_TOP - ARC_DROP));
const ARC_INSET =
  TITLE_RADIUS - Math.sqrt(Math.max(0, TITLE_RADIUS ** 2 - ARC_INTO ** 2));

/**
 * The room the arc needs to the right of the plaque: its own run, and then the
 * body's corner, which it has to come down clear of. The dropdown holds its
 * panel to this as a minimum width; here the body is the whole box, so the
 * label row carries it as padding instead — the box can then never be narrower
 * than the shape needs, however long the label runs.
 */
const ARC_CLEAR = ARC_RUN + RADIUS;

/**
 * Carves the concave corner. A box sits in the notch at the plaque's bottom
 * right and a quarter ellipse pinned to that box's *outer* corner is masked
 * away; the arc left behind meets the plaque's side vertically at one end and
 * the body's top horizontally at the other.
 *
 * Both radii are 100%, so the ellipse is whatever shape the box is — which is
 * what FLARE_RUN steers.
 */
const FLARE_MASK =
  "radial-gradient(ellipse 100% 100% at 100% 0%, transparent calc(100% - 0.5px), #000 100%)";

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
    title: "text-muted-foreground",
    field: "focus-within:bg-surface-2",
    text: "text-foreground placeholder:text-subtle",
  },
  solid: {
    fill: "bg-muted",
    outline: "",
    title: "text-muted-foreground",
    field: "focus-within:bg-background",
    text: "text-foreground placeholder:text-subtle",
  },
} satisfies Record<InputVersion, Record<string, string>>;

export function Input({
  version = "border",
  label = "Email",
  placeholder = "you@example.com",
  type = "email",
  defaultValue,
  onValueChange,
  className,
}: {
  version?: InputVersion;
  /** Printed in the plaque, and the field's label — the same string, once. */
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const s = STYLES[version];
  const fieldId = useId();
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ minWidth: MIN_W }}
    >
      {/* Shape layer. Kept free of text so the outline filter traces only the
          silhouette and never haloes the content. Body, plaque and arc touch,
          so the filter sees their union and draws no rim along the seams —
          which is what makes the whole thing read as one body rather than a
          badge sitting on a field.

          Painted back to front, the dropdown's order: the body first, the
          plaque last. They overlap by design now, and the plaque has to be the
          one on top — it is the trigger, and a trigger is never covered by its
          own panel. */}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0 z-10", s.outline)}
      >
        {/* The body. Its top edge crosses the plaque rather than meeting it,
            and its top left stays square — that edge runs straight on up into
            the plaque's, with nothing to round. */}
        <span
          className={cn("absolute inset-x-0 bottom-0", s.fill)}
          style={{
            top: BODY_TOP,
            borderRadius: `0 ${RADIUS}px ${RADIUS}px ${RADIUS}px`,
          }}
        />

        {/* The plaque, and the arc hanging off its lower right. The wrapper
            carries no fill of its own — it is only a frame — so the arc can
            sit outside its edge without being nested inside a painted box. */}
        <span className="absolute left-0 top-0">
          {/* Sets the width. Never seen, never read — but it is what lets the
              fill be exactly the label's size on the first paint, with no
              measurement to arrive late and drag the shape after it. */}
          <span
            aria-hidden="true"
            className={cn("invisible", TITLE_BOX)}
            style={TITLE_STYLE}
          >
            {label}
          </span>

          {/* The trigger's shape: a pill's top half, squared off along the
              bottom where the body has taken that edge over. It runs the
              plaque's full height, past where the body begins, so it is what
              covers the overlap. */}
          <span
            className={cn("absolute inset-0", s.fill)}
            style={{
              borderRadius: `${TITLE_RADIUS}px ${TITLE_RADIUS}px 0 0`,
            }}
          />

          {/* The concave corner. `left-full` is the whole adaptivity story: it
              is the plaque's right edge whatever the label does, and below the
              corner that edge is at its full width with a vertical tangent, so
              the arc leaves it flush. Its bottom is measured off BODY_TOP, the
              same number the body's own top is, so the two cannot land on
              different lines. */}
          <span
            className={cn("absolute left-full", s.fill)}
            style={{
              bottom: TITLE_H - BODY_TOP,
              width: ARC_RUN,
              height: ARC_DROP,
              marginLeft: -ARC_INSET,
              maskImage: FLARE_MASK,
              WebkitMaskImage: FLARE_MASK,
            }}
          />
        </span>
      </div>

      {/* The plaque. A real label rather than decoration now that it reads as
          a word: clicking it lands in the field, and the field needs no
          aria-label of its own. Same box as the sizer above, which is why both
          take TITLE_BOX and TITLE_STYLE — centred in the part of the plaque
          that shows, since its last TUCK pixels are inside the body.

          The padding on the row is the arc's landing room. It is the one thing
          holding the box wider than the plaque, and so the only reason a long
          label cannot eat the concave corner. */}
      <div className="relative z-20 flex" style={{ paddingRight: ARC_CLEAR }}>
        <label
          htmlFor={fieldId}
          className={cn("cursor-text", TITLE_BOX, s.title)}
          style={TITLE_STYLE}
        >
          {label}
        </label>
      </div>

      {/* The field. Its own box is what shows focus — a native outline would
          be a rectangle inside a rounded body, and squaring off against the
          silhouette is the one thing this whole shape is avoiding. */}
      <div className="relative z-20" style={{ padding: BODY_PAD }}>
        <div
          className={cn(
            "flex h-9 items-center transition-colors duration-200",
            "focus-within:ring-2 focus-within:ring-accent",
            s.field,
          )}
          style={{
            borderRadius: FIELD_RADIUS,
            paddingInline: FIELD_PAD,
          }}
        >
          <input
            id={fieldId}
            type={type}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onValueChange?.(event.target.value);
            }}
            placeholder={placeholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-[13px] outline-none",
              s.text,
            )}
          />
        </div>
      </div>
    </div>
  );
}
