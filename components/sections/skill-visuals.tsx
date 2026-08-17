import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  BookOpen,
  GraduationCap,
  Headphones,
  Language,
  Nodes,
  Rocket,
  Handshake,
  Trophy,
  type IconComponent,
} from "reicon-react";
import { TECH, TechIcon, type TechName } from "@/components/icons/tech";
import { DeviceMirror } from "@/components/sections/device-mirror";

/**
 * ────────────────────────────────────────────────────────────────
 *  SKILL VISUALS — one drawing per cell of the grid.
 *
 *  All four move, and none of them moves for the sake of it. A drawing earns
 *  motion when the thing it is about IS a motion: work leaving three tools and
 *  coming back as one result, everything arriving at the same place, a set with
 *  no end to it, a page being scrolled.
 *
 *  What every one of them shares:
 *
 *  · Hairlines for structure — `stroke-border-strong` for something that
 *    exists, `stroke-border` for something that is only context.
 *  · `foreground` is spent, not used. It is the ink that means *this is the
 *    point*, and at most one thing per drawing gets it.
 *  · Tailwind colour utilities rather than literals, so the whole set flips
 *    with the theme for free.
 *  · Every animation is CSS, declared in `globals.css`, and every animation
 *    has an answer for reduced motion in the block at the end of that file.
 *    Nothing in here reaches for GSAP: none of it is tied to scroll.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * ────────────────────────────────────────────────────────────────
 *  THE PORTRAIT — one circle, used by two drawings.
 *
 *  `invert dark:invert-0` is the whole reason this is a DOM element rather
 *  than something drawn into the SVG: the artwork is a white-stroke drawing,
 *  which is already right on the dark theme and needs flipping on the light
 *  one. A CSS filter does that on the element; an SVG `<image>` gives nothing
 *  to hang it on.
 *
 *  `alt=""` and not a description, and it matters. The portrait is decorative
 *  INSIDE a diagram that already carries its own `aria-label`, so a second
 *  description would be the same thing said twice — and an empty alt is also
 *  what stops a browser drawing its broken-image glyph when the file will not
 *  load, which leaves the monogram underneath showing through instead.
 *
 *  Sized by the caller, never here: `aspect-square` means setting a width is
 *  enough, so the AI board can hand it a percentage that tracks its own
 *  viewBox while the education board hands it plain pixels.
 * ────────────────────────────────────────────────────────────────
 */
const PORTRAIT = "/hero-illustration.png";

function Portrait({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={style}
      // No `position` of its own. `next/image` with `fill` needs a positioned
      // ancestor, and this element is it — but the AI board needs that to be
      // `absolute` and the education board needs `relative`, and both landing
      // on the same element is a coin toss decided by Tailwind's own ordering
      // rather than by the order they are written in. So the caller says.
      className={`block aspect-square overflow-hidden rounded-full border border-border-strong bg-background  ${className}`.trim()}
    >
      <Image
        src={PORTRAIT}
        alt=""
        fill
        sizes="128px"
        className="object-contain dark:invert"
      />
    </span>
  );
}

/**
 * ────────────────────────────────────────────────────────────────
 *  HOW BIG THE DRAWINGS ARE — the one number.
 *
 *  The share of its cell the AI board takes. 100% is edge to edge; 86% leaves a
 *  sliver of the cell clear on each side. That is the whole size control:
 *  everything inside a board is in viewBox units, so the board scales as one
 *  piece and every circle, gap, hairline and label follows this number without
 *  any of them being named anywhere.
 *
 *  The UX cell does not read this. It holds a device rather than a drawing,
 *  and a device sizes itself against the room it is given — see
 *  `device-mirror.tsx`.
 *
 *  Nothing else in here is a size. The numbers further down are proportions —
 *  how far apart things sit RELATIVE to each other — and they hold whatever
 *  this is set to.
 * ────────────────────────────────────────────────────────────────
 */
const FILL = "86%";

/**
 * The shared stage for the drawn diagrams.
 *
 * No size of its own: a board fills whatever box it is put in, and its caller
 * puts it in a box `FILL` wide. That is deliberate — one number decides how big
 * the drawing comes out, and neither this component nor anything inside it gets
 * a say. Everything in here is viewBox units, so a wider box is a bigger
 * drawing and nothing has to be re-measured for it.
 *
 * The stage is required rather than defaulted. There is one board left and it
 * computes its own, and a default here would only be a size waiting to be
 * inherited by accident.
 *
 * `stroke-fixed` is the other half of that. It holds every stroke at the width
 * it was authored at however far the board has been stretched, so these
 * hairlines keep matching the 1px rules of the grid around them instead of
 * fattening up with the box.
 */
function Board({
  children,
  label,
  width,
  height,
}: {
  children: ReactNode;
  label: string;
  width: number;
  height: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="stroke-fixed h-auto w-full"
    >
      {children}
    </svg>
  );
}

/**
 * ────────────────────────────────────────────────────────────────
 *  AI-FIRST — three tools, one pair of hands, one result.
 *
 *  Read left to right, which is the order the work actually happens in. The
 *  models are the inputs and they are drawn as inputs: same size, same
 *  treatment, no hierarchy between them, because which one is used is a
 *  question of the task and not of preference. Everything they produce goes
 *  through the middle, and only what comes out the other side counts.
 *
 *  The centre is the largest circle on the board on purpose. The claim is not
 *  that the tools do the work.
 *
 *  And that run is lit rather than merely drawn. Light leaves a tool, travels
 *  the rail that was already there, is taken in by the hands, and goes back out
 *  the far side to land on the result — the shape the board was making anyway,
 *  said a second time as the thing happening. All of its numbers are in `PULSE`.
 * ────────────────────────────────────────────────────────────────
 */
const MODELS: TechName[] = ["claude", "codex", "cursor"];

/**
 * ────────────────────────────────────────────────────────────────
 *  PROPORTIONS — not sizes. `FILL` is the size.
 *
 *  These are viewBox units, which means they only ever say how big each part
 *  is RELATIVE to the others. Doubling every one of them would change nothing
 *  on screen: the stage is derived from them too, so the drawing would just be
 *  described at twice the scale and still land at `FILL` of the cell. To make
 *  the drawing bigger or smaller, turn `FILL`, not these.
 *
 *  What these do decide is the balance — how much of the run is circle and how
 *  much is line. Raise `node` and the circles grow while the connectors
 *  between them shorten to make room, at the same overall size.
 *
 *  `NARROW` is that balance, retuned for a phone. It is the same drawing with
 *  `lead` and `tail` pulled in: a phone has far less width to spend, the
 *  horizontal travel is the part that does not need to survive, and everything
 *  freed up by shortening it goes straight into the circles. Same drawing,
 *  less journey, bigger nodes.
 * ────────────────────────────────────────────────────────────────
 */
const AI = {
  /** Radius of a source circle, and of the result circle. */
  node: 22,
  /** The logo inside a source circle, edge to edge. */
  icon: 22,
  /**
   * Radius of the middle circle — which IS the portrait: the face is placed
   * and sized off this one number and nothing else. Turn this to resize it on
   * desktop, and `NARROW.hub` to resize it on a phone.
   */
  hub: 28,
  /** Vertical distance from the middle row to each outer one. */
  spread: 54,
  /** Clear run between the source column and the hub. */
  lead: 108,
  /** Clear run between the hub and the result. */
  tail: 88,
  /** The star, as a share of the circle holding it. */
  star: 0.44,
};

/**
 * Below `md`.
 *
 * `hub` has to be restated here rather than inherited, and the reason is the
 * one trap in this file: every number above is a proportion OF THE SCENE, and
 * the scene this describes is a third narrower. Carrying 45 across left the
 * portrait unchanged as a number and much bigger as a face — a quarter of the
 * drawing's width on desktop, better than a third of it here. Anything whose
 * share of the width should survive the run being shortened has to be
 * restated.
 */
const NARROW = {
  ...AI,
  node: 14,
  icon: 14,
  hub: 20,
  lead: 40,
  tail: 34,
  spread: 34,
};

type Scene = ReturnType<typeof scene>;

/**
 * Turns a set of those numbers into the stage and the four x positions the
 * board actually draws with. The stage is exactly big enough for the scene, so
 * there is never any dead margin to centre against.
 */
function scene(c: typeof AI) {
  const width = c.node * 4 + c.hub * 2 + c.lead + c.tail;
  const height = Math.max(c.spread + c.node, c.hub) * 2;
  return {
    ...c,
    width,
    height,
    midY: height / 2,
    sourceX: c.node,
    hubX: c.node * 2 + c.lead + c.hub,
    resultX: width - c.node,
  };
}

/**
 * One connector, from a source circle's right edge to the hub's left edge.
 *
 * The handles sit half the gap in from each end, horizontally, which is what
 * makes the curve leave and arrive flat — a line meeting a circle at an angle
 * reads as clipping into it rather than as docking. On the middle row the two
 * ends share a y and the same formula degenerates to a straight line, so that
 * row needs no special case.
 */
function connector(s: Scene, y: number) {
  const from = s.sourceX + s.node;
  const to = s.hubX - s.hub;
  const handle = (to - from) / 2;
  return `M${from} ${y} C${from + handle} ${y}, ${to - handle} ${s.midY}, ${to} ${s.midY}`;
}

/** The last leg: the hub's right edge to the result's left. Straight, always. */
function tail(s: Scene) {
  return `M${s.hubX + s.hub} ${s.midY} H${s.resultX - s.node}`;
}

/**
 * ────────────────────────────────────────────────────────────────
 *  THE LIGHT ON THE RAILS — one clock, one schedule.
 *
 *  Nothing new is drawn for this. A bead is one more copy of a rail laid over
 *  the rail, carrying a dash pattern with a gap so much longer than the path
 *  that only ever one dash is on it, and `stroke-dashoffset` walks that dash
 *  from one end to the other. What you see light up is the hairline itself.
 *
 *  `pathLength={100}` is what makes this one set of numbers instead of four. It
 *  renames every rail's length to 100 whatever it actually measures, so a
 *  curved outer connector and the short straight tail take the same dash and
 *  the same offsets, and the times below are times rather than distances.
 *
 *  ────────────────────────────────────────────────────────────────
 *  WHY A SCHEDULE, AND NOT LOOSE CLOCKS LIKE THE EDUCATION BOARD
 *
 *  There, every chip has its own cycle and the phases are left to drift, which
 *  works because nothing on that board depends on anything else. Here
 *  everything does: a bead leaving the portrait with nothing having arrived, or
 *  the result flashing on its own, breaks the one sentence the drawing makes.
 *
 *  So there is a single `period` and one hand-written list of departures, and
 *  the two later legs are each just that departure plus what the legs before
 *  them take. Every element runs on that same period with its own
 *  `animation-delay` — which is how a fixed schedule is spelled in CSS, and why
 *  a leg gets one element per departure rather than one element looping.
 *
 *  Irregular, not random, for the reason the chips are: this renders on the
 *  server first, and `Math.random()` here would put one set of numbers in the
 *  HTML and a different set in the hydrated page. The gaps are hand-picked so
 *  no two are alike and the run does not come back around inside anyone's
 *  attention span.
 *
 *  ────────────────────────────────────────────────────────────────
 *  WHY A BEAD IS A BLURRED SLAB SEEN THROUGH A WINDOW
 *
 *  A dash is a capsule with two hard ends, and a hard-ended capsule of solid
 *  ink reads as something being dragged along the rail rather than as light on
 *  it. What it wants is to come up out of the hairline and sink back into it,
 *  which means a gradient at each end — and a gradient is the one thing a dash
 *  cannot carry. The dash moves and an SVG gradient is nailed to the coordinate
 *  system it was declared in, so the two can never travel together.
 *
 *  So the fade is made the other way round, out of a blur. The beads are
 *  stroked far wider than any rail and the whole group is blurred, which softens
 *  their ends and their sides alike; then that group is masked by the rails
 *  themselves, drawn at the width a lit rail should read. The sides are cut
 *  straight back off and the ends keep their fade. What is left is a bead that
 *  rises out of the hairline, holds at full strength across its middle, and
 *  goes back down into it — `soften` is the length of those two ramps.
 *
 *  The glow is hung outside that mask rather than inside it, so it is the
 *  finished bead that glows and not the slab it was cut from — inside, the mask
 *  would trim the glow off with the rest of the overhang.
 *
 *  Each incoming rail has its own mask. The three paths share their final
 *  point, so one mask containing all of them would let the blurred body of a
 *  bead shine through its two neighbours for the instant it crosses that
 *  junction. The outgoing rail gets a fourth mask for the same reason: a bead
 *  is only ever allowed through the rail it actually belongs to.
 *
 *  The softening filter uses the board itself as its region. That matters for
 *  the middle input and the tail: both are horizontal lines with a zero-height
 *  bounding box, which gives an automatically-sized blur nowhere to render.
 * ────────────────────────────────────────────────────────────────
 */
const PULSE = {
  /** The whole show, start to repeat. Every time in `schedule` is inside it. */
  period: 13,
  /** A source circle to the portrait, in seconds. */
  travelIn: 0.4,
  /** The beat the portrait holds it for before passing it on. */
  hold: 0.18,
  /** The portrait to the result, in seconds. */
  travelOut: 0.4,
  /** How long a bead is, as a share of the rail it runs on. */
  bead: 0.17,
  /**
   * How wide a lit rail reads. This is the mask's stroke, not the bead's, so
   * it is in screen pixels like every other hairline in the diagram — the rails
   * under it are 1, and a bead a half wider than its rail is what makes the
   * light sit ON the wire rather than replace a length of it.
   */
  weight: 1.5,
  /**
   * The slab behind that window, in board units, and the blur that gives it its
   * ends. `soften` is the one to turn: it is the blur's standard deviation, so
   * each end of a bead ramps up over roughly twice this, and at 0 the bead goes
   * back to being the solid capsule it started as.
   *
   * `body` is never seen whole. Its only job is to be wide enough that the
   * window never catches an edge of it, which is also what keeps the middle of
   * a bead at full strength after the blur has taken its share.
   */
  body: 12,
  soften: 2.2,
  /** How far the glow reaches past the rail, in board units. */
  glow: 2.5,
  /**
   * Who sets off and when, in seconds from the top of the period. `row` indexes
   * `MODELS`, so 0 is Claude, 1 Codex, 2 Cursor.
   *
   * Two rules a new line has to keep, and both are about beads colliding. No
   * two departures on the same row closer together than `travelIn`, or one rail
   * carries two at once; and no two departures at all closer than `travelOut`,
   * because the tail is the one rail every departure ends up on.
   */
  schedule: [
    { row: 1, at: 0 },
    { row: 0, at: 1.4 },
    { row: 2, at: 3.9 },
    { row: 1, at: 5.1 },
    { row: 0, at: 8.2 },
    { row: 2, at: 9.3 },
  ],
};

/**
 * The dash pattern and the two offsets that walk one bead down one rail.
 *
 * Every rail is declared 100 long, so these are percentages of it: a dash `len`
 * long, then a gap wide enough that the next dash in the pattern is nowhere
 * near the path. `span` is one whole period of that pattern, and it is also
 * exactly how far the offset travels in `period` seconds — so `span` IS the
 * speed, and setting it to `100 / travel` per second is the same thing as
 * saying the rail takes `travel` seconds to cross. That is the number worth
 * naming, so it is the one the caller passes.
 */
function bead(travel: number) {
  const span = (100 * PULSE.period) / travel;
  const len = 100 * PULSE.bead;
  return {
    strokeDasharray: `${len} ${span - len}`,
    "--pulse-period": `${PULSE.period}s`,
    "--bead-from": `${len}`,
    "--bead-to": `${len - span}`,
  } as CSSProperties;
}

function AiFirst() {
  return (
    <>
      <AiScene layout={scene(NARROW)} id="ai-narrow" className="md:hidden" />
      <AiScene layout={scene(AI)} id="ai-wide" className="hidden md:block" />
    </>
  );
}

function AiScene({
  layout: s,
  id,
  className,
}: {
  layout: Scene;
  /**
   * Names this scene's masks and filter. Spelled out rather than generated
   * because both scenes render into the same document and an SVG `url(#…)` is
   * resolved document-wide — two definitions under one name and one of them
   * wins for both.
   * `useId` would be the other answer, and it is a client hook.
   */
  id: string;
  className: string;
}) {
  const rows = [s.midY - s.spread, s.midY, s.midY + s.spread];

  return (
    // `FILL` here and not on the `Board` inside it: the portrait is placed in
    // percentages of THIS box, so the box and the board it holds have to be
    // the same width or the two come apart.
    <div style={{ width: FILL }} className={`relative mx-auto ${className}`}>
      <Board
        label="Claude Code, Codex and Cursor feeding into one pair of hands, and one result out the far side"
        width={s.width}
        height={s.height}
      >
        {/* What the light is allowed to be seen through. Each rail gets its own
            mask so the blurred body of a bead cannot show through either of
            the neighbouring inputs where the three paths meet.

            `#fff` is the one literal colour in the set, and it is not really a
            colour: inside a mask white means KEEP and black means DROP, so
            there is nothing here for the theme to flip. */}
        <defs>
          {rows.map((y, row) => (
            <mask
              key={y}
              id={`${id}-input-${row}`}
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={s.width}
              height={s.height}
            >
              <path
                d={connector(s, y)}
                stroke="#fff"
                strokeWidth={PULSE.weight}
                strokeLinecap="round"
                fill="none"
              />
            </mask>
          ))}
          <mask
            id={`${id}-output`}
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={s.width}
            height={s.height}
          >
            <path
              d={tail(s)}
              stroke="#fff"
              strokeWidth={PULSE.weight}
              strokeLinecap="round"
              fill="none"
            />
          </mask>
          <filter
            id={`${id}-soften`}
            filterUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={s.width}
            height={s.height}
          >
            <feGaussianBlur stdDeviation={PULSE.soften} />
          </filter>
        </defs>

        {/* Connectors, first so everything else lands on top of them. */}
        <g className="stroke-border-strong" strokeWidth="1" fill="none">
          {rows.map((y) => (
            <path key={y} d={connector(s, y)} />
          ))}
          <path d={tail(s)} />
        </g>

        {/* The light on those rails — one path per departure per leg, each one
            a copy of the rail it runs on. See `PULSE` for what fires when.

            Here rather than last so a bead passes under the circles at either
            end: the glow going INTO the portrait instead of over the top of it
            is what makes the arrival read as an arrival.

            Each path is softened and cut by its own mask before the outer
            group adds the glow to the finished, isolated beads. */}
        <g
          style={{
            filter: `drop-shadow(0 0 ${PULSE.glow}px var(--foreground))`,
          }}
        >
          <g
            className="stroke-foreground"
            fill="none"
            strokeWidth={PULSE.body}
            // Butt, and it has to be. A round cap on a stroke this wide would
            // hang half that width past each end of the dash, which is most of
            // a bead again — and the blur is what shapes those ends now.
            strokeLinecap="butt"
          >
            {PULSE.schedule.map((departure) => (
              <g key={`${departure.row}-${departure.at}`}>
                <g mask={`url(#${id}-input-${departure.row})`}>
                  <path
                    className="animate-rail-pulse"
                    pathLength={100}
                    d={connector(s, rows[departure.row])}
                    filter={`url(#${id}-soften)`}
                    style={{
                      ...bead(PULSE.travelIn),
                      animationDelay: `${departure.at}s`,
                    }}
                  />
                </g>
                <g mask={`url(#${id}-output)`}>
                  <path
                    className="animate-rail-pulse"
                    pathLength={100}
                    d={tail(s)}
                    filter={`url(#${id}-soften)`}
                    style={{
                      ...bead(PULSE.travelOut),
                      animationDelay: `${departure.at + PULSE.travelIn + PULSE.hold}s`,
                    }}
                  />
                </g>
              </g>
            ))}
          </g>
        </g>

        {MODELS.map((name, index) => {
          const cy = rows[index];
          const Mark = TECH[name].mark;
          return (
            <g key={name}>
              <circle
                cx={s.sourceX}
                cy={cy}
                r={s.node}
                strokeWidth="1"
                className="fill-background stroke-border-strong"
              />
              {/* A nested `<svg>`, not a `<g transform>`. These come out of
                  `@thesvg/react` with their own root and their own viewBox,
                  and x/y/width/height on an inner `<svg>` is how SVG places
                  one drawing inside another without anyone having to know what
                  that viewBox was. */}
              <Mark
                x={s.sourceX - s.icon / 2}
                y={cy - s.icon / 2}
                width={s.icon}
                height={s.icon}
                className="text-foreground"
              />
            </g>
          );
        })}

        {/* The middle is left empty — the portrait that fills it is a DOM
            element sitting over this board, not part of it. What stays here is
            the ground under it, so the connectors have something to arrive at
            even in the moment before the image has decoded. */}
        <circle cx={s.hubX} cy={s.midY} r={s.hub} className="fill-surface-2" />

        {/* The result, and the only ink on the board with any weight. */}
        <circle
          cx={s.resultX}
          cy={s.midY}
          r={s.node}
          strokeWidth="1"
          className="fill-background stroke-border-strong"
        />
        <path
          transform={`translate(${s.resultX} ${s.midY}) scale(${(s.node * s.star) / 9})`}
          d="M0-9 2.29-3.15 8.56-2.78 3.71 1.21 5.29 7.28 0 3.9-5.29 7.28-3.71 1.21-8.56-2.78-2.29-3.15Z"
          className="fill-foreground"
        />
      </Board>

      {/* Over the ring the board leaves for it. Placed in percentages off the
          same numbers the ring was drawn from, and `Board` holds its viewBox
          ratio at every width — so a percentage of this wrapper is a
          percentage of the viewBox, exactly, and the two never drift. */}
      <Portrait
        style={{
          left: `${(s.hubX / s.width) * 100}%`,
          top: `${(s.midY / s.height) * 100}%`,
          width: `${((s.hub * 2) / s.width) * 100}%`,
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      />

      {/* The result catching it. Off the same three numbers the board drew that
          circle from, so this disc and that one are the same disc — the
          argument for that is the portrait's, a few lines up.

          Up here and not in the SVG for the same reason the portrait is: what
          lands is a linear-gradient sweep, and a gradient is a DOM thing. It
          runs at low opacity and passes OVER the star rather than replacing it,
          which is the difference between a glint and a light going on.

          One layer per departure, stacked, and the schedule keeps all but one
          of them dark at any moment. */}
      <span
        aria-hidden
        style={{
          left: `${(s.resultX / s.width) * 100}%`,
          top: `${(s.midY / s.height) * 100}%`,
          width: `${((s.node * 2) / s.width) * 100}%`,
        }}
        className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
      >
        {PULSE.schedule.map((departure) => (
          <span
            key={`${departure.row}-${departure.at}`}
            className="animate-star-shine absolute inset-0"
            style={
              {
                "--pulse-period": `${PULSE.period}s`,
                animationDelay: `${
                  departure.at + PULSE.travelIn + PULSE.hold + PULSE.travelOut
                }s`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </div>
  );
}

/**
 * ────────────────────────────────────────────────────────────────
 *  EDUCATION — everything arriving at the same place.
 *
 *  The only drawing on the page that had to move, because the sentence it is
 *  making is a verb. A degree, a certificate, a podium, and years of work that
 *  was not any of those come in from wherever they came from and are taken in
 *  by the same person. Laid out flat as a list it is a CV; converging, it is
 *  the point, which is that none of it arrived along one path.
 *
 *  Each chip's position in the layout is its RESTING place, the spot where it
 *  holds long enough to be read. `--from-x` / `--from-y` are how far outside
 *  that it starts; `--to-x` / `--to-y` are the trip from there into the
 *  portrait, which is the leg that makes this absorption rather than eight
 *  labels landing near somebody. All four are offsets, so one keyframe block
 *  serves every direction and a reader who asked for no motion gets the same
 *  diagram standing still.
 *
 *  ────────────────────────────────────────────────────────────────
 *  WHY EVERY CHIP HAS ITS OWN CLOCK
 *
 *  `delay` alone would only shift a lockstep: eight chips on one duration is
 *  eight chips arriving in the same order at the same interval forever, which
 *  reads as a carousel, not as things turning up. So each one gets its own
 *  `cycle` as well, and none of them divides into another. The phase between
 *  any two drifts, so they group and regroup on their own — sometimes one
 *  arrives alone, sometimes two land together, and the pattern does not come
 *  back around inside anyone's attention span.
 *
 *  These are hand-picked and not random on purpose. This renders on the server
 *  first, and a `Math.random()` here would produce one set of numbers in the
 *  HTML and a different set at hydration.
 * ────────────────────────────────────────────────────────────────
 */
type Arrival = {
  label: string;
  Icon: IconComponent;
  /** Resting offset from the centre, in px. */
  x: number;
  y: number;
  /** When this chip first sets off, in seconds. */
  delay: number;
  /** How long one whole trip takes. No two share a factor. */
  cycle: number;
};

const ARRIVALS: Arrival[] = [
  {
    label: "University",
    Icon: GraduationCap,
    x: -158,
    y: -88,
    delay: 0,
    cycle: 7.4,
  },
  { label: "App Flows", Icon: Nodes, x: 0, y: -124, delay: 0.9, cycle: 8.6 },
  {
    label: "C1 Cambridge",
    Icon: Language,
    x: 158,
    y: -88,
    delay: 2.3,
    cycle: 6.7,
  },
  { label: "Hackathons", Icon: Trophy, x: -172, y: -4, delay: 3.1, cycle: 9.2 },
  { label: "Courses", Icon: BookOpen, x: 172, y: -4, delay: 4.6, cycle: 7.9 },
  {
    label: "Side Projects",
    Icon: Rocket,
    x: -158,
    y: 82,
    delay: 5.2,
    cycle: 8.3,
  },
  { label: "Sales", Icon: Handshake, x: 158, y: 82, delay: 6.4, cycle: 6.1 },
  {
    label: "Customer Support",
    Icon: Headphones,
    x: 0,
    y: 122,
    delay: 7.1,
    cycle: 9.7,
  },
];

/**
 * How far past its resting place a chip starts, as a share of that distance.
 *
 * Worth keeping high enough that the start sits inside the edge fade below —
 * a chip that appears in clear space appears from nothing, which is the thing
 * the mask is there to prevent.
 */
const APPROACH = 0.75;

function Education() {
  return (
    // `mask-edges` on all four sides, not just the two the marquee needs: these
    // arrive from every direction, so every edge is one something crosses.
    <div
      style={{ "--mask-x": "13%", "--mask-y": "15%" } as CSSProperties}
      className="mask-edges relative h-[300px] w-full overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <Portrait className="relative" style={{ width: 84 }} />
      </div>

      {ARRIVALS.map((arrival) => (
        <div
          key={arrival.label}
          style={
            {
              left: `calc(50% + ${arrival.x}px)`,
              top: `calc(50% + ${arrival.y}px)`,
              "--from-x": `${Math.round(arrival.x * APPROACH)}px`,
              "--from-y": `${Math.round(arrival.y * APPROACH)}px`,
              // The way back in. A chip's resting place is `arrival` away from
              // the centre, so the centre is exactly that much back the other
              // way.
              "--to-x": `${-arrival.x}px`,
              "--to-y": `${-arrival.y}px`,
              "--converge-duration": `${arrival.cycle}s`,
              animationDelay: `${arrival.delay}s`,
            } as CSSProperties
          }
          // `-translate-*` is on the wrapper and the animation is on the
          // child, because both want `transform` and the wrapper's is what
          // makes `left`/`top` mean the chip's centre.
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div className="animate-converge flex items-center gap-2 whitespace-nowrap rounded-full border border-border  px-3 py-1.5">
            <arrival.Icon
              size={13}
              weight="Outline"
              strokeWidth={1.4}
              className="shrink-0 text-foreground"
            />
            <span className="text-[12px] font-medium tracking-tight text-foreground">
              {arrival.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ────────────────────────────────────────────────────────────────
 *  UX / UI — this page, on a screen, on this page.
 *
 *  A laptop on a wide screen and a phone on a narrow one, and what is on each
 *  is a live miniature of the page you are reading, scrolled to exactly where
 *  you are. Move and it moves.
 *
 *  Every other drawing on this grid says what the skill is. This one shows the
 *  work: it is the same interface, laid out for two devices, and it makes that
 *  point by being the thing rather than by illustrating it. The phone mirror
 *  is genuinely the phone layout — the frame is rendered at 390 wide and then
 *  scaled, not shrunk from the desktop one.
 *
 *  All of it lives in `device-mirror.tsx`, including the two guards that keep
 *  a page rendering itself from being a bad idea.
 * ────────────────────────────────────────────────────────────────
 */
function UxUi() {
  return <DeviceMirror />;
}

/**
 * ────────────────────────────────────────────────────────────────
 *  STACK — the tools, running past.
 *
 *  A marquee rather than a grid because a grid of logos is a claim to be
 *  complete, and this is not a complete list — it is a sample that keeps
 *  going. Three rows, the middle one against the other two, at three
 *  durations that do not divide into each other, so the rows never line up
 *  into one block sliding sideways.
 *
 *  Two things this only works because of: the list in each row is rendered
 *  TWICE and the row travels exactly half its own width, which is what makes
 *  the loop point invisible; and the spacing between chips is a margin on the
 *  chip rather than a `gap` on the row, because a gap is one short of a whole
 *  number of chips and half of that is not the seam.
 * ────────────────────────────────────────────────────────────────
 */
const ROWS: { items: TechName[]; seconds: number; reverse: boolean }[] = [
  {
    items: ["react", "nextjs", "typescript", "tailwind", "node"],
    seconds: 44,
    reverse: false,
  },
  {
    items: ["figma", "photoshop", "illustrator", "paper", "framer"],
    seconds: 37,
    reverse: true,
  },
  {
    items: ["reactNative", "expo", "supabase", "postgres", "vercel"],
    seconds: 51,
    reverse: false,
  },
];

function Chip({ name }: { name: TechName }) {
  return (
    <span className="mr-3 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-background px-3.5 py-2.5">
      <TechIcon name={name} size={17} className="shrink-0" />
      <span className="text-[13px] font-medium tracking-tight text-foreground">
        {TECH[name].label}
      </span>
    </span>
  );
}

function Stack() {
  return (
    // The same edge fade the education board uses, with the vertical axis
    // switched off: rows only ever leave through the sides. A mask rather than
    // two gradient overlays, because the cell behind this is `surface` in one
    // theme and `background` in the other and an overlay would have to be told
    // which — a mask does not care what it is sitting on.
    <div
      style={{ "--mask-x": "14%", "--mask-y": "0%" } as CSSProperties}
      className="mask-edges w-full"
    >
      <div className="flex flex-col gap-3 overflow-hidden">
        {ROWS.map((row) => (
          <div
            key={row.items.join()}
            style={{ "--marquee-duration": `${row.seconds}s` } as CSSProperties}
            className={`flex w-max ${
              row.reverse ? "animate-marquee-reverse" : "animate-marquee"
            }`}
          >
            {/* Twice, and the second one is what the first loops into. */}
            {[0, 1].map((copy) => (
              <span key={copy} aria-hidden={copy === 1} className="flex">
                {row.items.map((name) => (
                  <Chip key={name} name={name} />
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Slug to drawing. Same shape as `components/library/preview.tsx`: one switch,
 * one case per entry, and an unmatched slug returns nothing rather than
 * throwing — a cell with no drawing yet is a gap, not a broken page.
 */
export function SkillVisual({ slug }: { slug: string }) {
  switch (slug) {
    case "ai-first":
      return <AiFirst />;
    case "education":
      return <Education />;
    case "ux-ui":
      return <UxUi />;
    case "stack":
      return <Stack />;
    default:
      return null;
  }
}
