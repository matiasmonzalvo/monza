"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/lib/theme";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * ────────────────────────────────────────────────────────────────
 *  THE SEAM — where the work half of the page plugs into the skills half.
 *
 *  The two blocks either side of this band do not move. What moves is the end
 *  of each one: the block above finishes in a connector and the block below
 *  starts with one, and each reaches into the gap by drawing a neck out behind
 *  its bar — a length of the block's own rails, extending. They meet in the
 *  middle, three triangles drop into three notches cut to take them, and the
 *  dust they had been squeezing gets thrown out sideways.
 *
 *  So the rails only ever span the gap because a connector carried them there.
 *  Apart, the two halves are two separate objects with nothing between them;
 *  closed, the column is continuous from one block through to the other. That
 *  is the whole gesture, and it is why neither block draws a rule of its own
 *  along this edge — the connector's own outline is the end of the block.
 *
 *  All of it is scrubbed, so it runs backwards on the way up as cleanly as it
 *  runs forwards on the way down — the connection is something you can pull
 *  apart again, not an animation that fires once and is spent.
 *
 *  Four things are worth knowing before moving anything:
 *
 *  1. The band's height is not a number, it is `bar + gap + bar`. The gap is
 *     both the air you see at rest and the distance the pair has to close, so
 *     changing it moves the travel and the height together and they cannot
 *     drift apart.
 *  2. A neck never changes size, it is only ever scaled — it holds its full
 *     length in the layout from the start, which is what the bar in front of
 *     it is offset against. Nothing here reflows while it runs.
 *  3. The triangle is centred on the join, so half of it lives in each bar.
 *     That is what makes it land dead centre of the block the two become — and
 *     it is why the notch is exactly half the triangle's height and half its
 *     width. Both are derived, never typed twice.
 *  4. The dust is a canvas over both halves, full-bleed rather than column
 *     width, which is what lets the burst carry past the rails and out toward
 *     the screen edges. Over, not behind, because by the time it goes off the
 *     two halves have closed and left no gap to see it through.
 *
 *  Everything worth nudging lives in CONFIG. Nothing below it needs touching
 *  to retune the effect.
 * ────────────────────────────────────────────────────────────────
 */
const CONFIG = {
  /**
   * ─── THE BAND ──────────────────────────────────────────────────
   * The strip of page the connector lives in: a bar at each end and the air
   * between them. Both bars move, so each one travels half of `gap`.
   */
  band: {
    /** Height of one bar — the body of the hardware. */
    bar: { sm: 34, md: 64 },
    /**
     * How far apart the two sit before the scroll closes them. Half of it is
     * how long each neck runs out to, so this one number is the air at rest,
     * the travel, and the reach of the rails that follow.
     */
    gap: { sm: 76, md: 200 },
    /**
     * How far past touching the two are driven. 0 is a clean seat — the
     * triangle exactly fills its notch, which is what the geometry is cut for.
     * Positive drives them together harder, and shows as the triangle sinking
     * past its slot.
     */
    overlap: 0,
  },

  /**
   * ─── THE CONNECTOR ─────────────────────────────────────────────
   * One triangle per position, standing half out of the lower bar, and a notch
   * in the upper bar cut to take exactly the half that stands out.
   */
  connector: {
    /** Where each one sits across the bar, 0-1 of its width. */
    at: [0.16, 0.5, 0.84],
    /**
     * The triangle: base across, and point to base. Both halved to get the
     * notch, so a wider triangle opens a wider mouth on its own. `h` may not
     * exceed twice the smallest `bar` above, or the notch cuts clean through.
     */
    tri: {
      w: { sm: 40, md: 52 },
      h: { sm: 28, md: 40 },
    },
  },

  /**
   * ─── THE SCROLL ────────────────────────────────────────────────
   * Where the run starts and ends, and where inside it contact happens.
   */
  scroll: {
    start: "top 88%",
    end: "center 38%",
    /**
     * Share of the run spent closing. What is left after it is the moment the
     * current arrives — the flare, and the dust being thrown. Lower values snap
     * the bars together early and leave a longer afterglow.
     */
    seat: 0.62,
    /**
     * How the two halves close. `power2.in` has them drifting toward each
     * other and then dropping the last stretch quickly, which is what makes it
     * read as a click rather than a slide. "none" is a plain constant rate.
     */
    ease: "power2.in",
  },

  /**
   * ─── THE FLARE ─────────────────────────────────────────────────
   * What contact looks like: the triangle blooming where it seats, and a line
   * running out along the join. Both are `--foreground` — the connector never
   * borrows an accent colour, it just lights up in the page's own ink.
   */
  flare: {
    /** Size of the bloom behind a triangle, px, and how far it is blurred. */
    size: 52,
    blur: 14,
    /** How bright it goes at the instant of contact, and what it settles to. */
    peak: 0.55,
    rest: 0.14,
    /** Share of the post-contact run the bloom takes to reach that peak. */
    rise: 0.22,
  },

  /**
   * ─── THE DUST ──────────────────────────────────────────────────
   * The loose field in the gap. Built the way the portrait's is: fixed homes, a
   * slow wander around them, and a cursor that pushes them aside.
   */
  field: {
    /** How many motes. The mobile band is shorter and narrower, so it needs fewer. */
    count: { sm: 220, md: 460 },
    /** Dot radius in CSS px, picked per mote inside this range. */
    dot: { min: 0.7, max: 1.7 },
    /**
     * How far out the dust reaches, as a share of the band's half width — 1 is
     * the screen edge — and how hard it bunches toward the middle on the way
     * there. 1 is an even wash across the band; higher pulls it in, so the
     * field reads as something gathered on the connector.
     */
    reach: 0.98,
    bias: 1.7,
    /** How much of the gap's height it fills. 1 puts motes against both bars. */
    spread: 0.92,
    /** The wander: px travelled, and roughly radians per second. */
    drift: { amount: 4, speed: 0.9 },
    /** How visible it is before the two halves start closing in on it. */
    rest: 0.5,
  },

  /**
   * ─── THE BURST ─────────────────────────────────────────────────
   * The gap closing squeezes the dust onto the join; contact throws it off.
   */
  burst: {
    /**
     * How far a mote is thrown, px, and how much of that throw is vertical.
     * Kept low: the throw is meant to read as going out to the sides, and it is
     * also the axis the canvas runs out of room on first.
     */
    distance: 340,
    lift: 0.26,
    /** How much of the squeeze is onto the join line, and how much is inward. */
    squeeze: 0.82,
    gather: 0.18,
  },

  /** Cursor push, one for one with the portrait's. */
  pointer: {
    /** How far the influence reaches, px. */
    radius: 120,
    /** How far a mote right under the cursor is pushed. Negative pulls them in. */
    strength: 26,
    /** How fast they chase it. Higher = snappier, lower = more syrupy. */
    ease: 6,
    /** How much motes differ in how hard they react. 0 = all the same. */
    variance: 0.35,
  },

  /**
   * The dust is the page's own ink and nothing else — these are `--foreground`
   * in each theme, spelled out because they are painted onto a canvas rather
   * than by the stylesheet. Only how much of it shows changes.
   */
  palette: {
    light: { color: "#0a0a0a", opacity: 0.5 },
    dark: { color: "#ededed", opacity: 0.45 },
  },
};

const TAU = Math.PI * 2;

/**
 * The bars, against the page column `<Frame>` draws.
 *
 * Two pixels narrower than the 1200 column on purpose: the outline below is a
 * drop shadow, so it falls *outside* the box rather than inside it like a
 * border would. 1198 plus a pixel of rim either side lands the bar's edges on
 * exactly the pixels the frame's rails occupy. Below the column it is the same
 * trade, held with `calc`.
 */
const PLATE = "mx-auto w-[calc(100%_-_2px)] max-w-[1198px]";

/**
 * The neck a connector draws out behind it: a length of the block's own rails,
 * and nothing else. The full 1200 here, because its rails are real borders and
 * so fall *inside* the box — which lands them on the very pixels the bar's rim
 * lands on, and the line runs on through the join without a step.
 */
const NECK =
  "mx-auto w-full max-w-[1200px] border-x border-border bg-background";

/**
 * A 1px rim traced around whatever is inside, silhouette and all — the same
 * trick the navbar outlines its flares with. It has to sit on a *parent* of
 * the shape: clipping is applied after filtering, so a clip path on the same
 * element would cut the rim straight back off again.
 */
const RIM = [
  "drop-shadow(0 1px 0 var(--border))",
  "drop-shadow(0 -1px 0 var(--border))",
  "drop-shadow(1px 0 0 var(--border))",
  "drop-shadow(-1px 0 0 var(--border))",
].join(" ");

/** A 0-1 position as a CSS percentage, without the binary-fraction tail. */
const pct = (position: number) => `${+(position * 100).toFixed(4)}%`;

/**
 * The upper bar: a rectangle with a triangular bite out of its bottom edge
 * under each connector. Walked clockwise from the top left, which is why the
 * notches come right to left along the bottom run.
 */
const NOTCHED = `polygon(0 0, 100% 0, 100% 100%, ${[...CONFIG.connector.at]
  .sort((a, b) => b - a)
  .map((position) => {
    const x = pct(position);
    return `calc(${x} + var(--notch-w)) 100%, ${x} calc(100% - var(--notch-h)), calc(${x} - var(--notch-w)) 100%`;
  })
  .join(", ")}, 0 100%)`;

/** The triangle itself, point up. */
const TRIANGLE = "polygon(50% 0%, 100% 100%, 0% 100%)";

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * The gap as it currently stands, whatever breakpoint is live — read off the
 * boxes rather than off the config, so the two can never disagree.
 * `clientHeight` and `offsetHeight` both ignore transforms, so this is the same
 * number before, during and after the close.
 */
const gapOf = (band: HTMLElement, top: HTMLElement, bottom: HTMLElement) =>
  Math.max(0, band.clientHeight - top.offsetHeight - bottom.offsetHeight);

type Mote = {
  /** Where it belongs. */
  hx: number;
  hy: number;
  r: number;
  /** Drift amplitude and frequency per axis, so no path is a clean circle. */
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  /** Which way, and how far, contact throws it. */
  dx: number;
  dy: number;
  distance: number;
  /** How hard it reacts to the cursor. */
  w: number;
  /** Where the cursor currently has it, relative to home. The only mutable state. */
  ox: number;
  oy: number;
};

export function PlugSeam() {
  const bandRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketNeckRef = useRef<HTMLDivElement>(null);
  const socketBarRef = useRef<HTMLDivElement>(null);
  const plugNeckRef = useRef<HTMLDivElement>(null);
  const plugBarRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  /** 0-1 down the run. Written by the scrub, read by the canvas. */
  const progressRef = useRef(0);
  const paletteRef = useRef(CONFIG.palette[theme]);
  const stillRef = useRef(reducedMotion);
  const repaintRef = useRef<() => void>(() => {});

  // ── The dust ────────────────────────────────────────────────────
  useEffect(() => {
    const band = bandRef.current;
    const canvas = canvasRef.current;
    const socketBar = socketBarRef.current;
    const plugBar = plugBarRef.current;
    if (!band || !canvas || !socketBar || !plugBar) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let motes: Mote[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let clock = 0;
    let last = 0;
    let onScreen = true;
    let pageVisible = !document.hidden;
    let disposed = false;

    // Kept in viewport coordinates and resolved against the canvas once per
    // frame, so the motes also react when the page scrolls under a still cursor.
    let pointerClientX = 0;
    let pointerClientY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerOn = false;

    /** True when the backing store actually changed size. */
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === width && h === height) return false;

      width = w;
      height = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const build = () => {
      if (width === 0) return;

      const { count, dot, reach, bias, spread, drift } = CONFIG.field;
      const { distance, lift } = CONFIG.burst;
      const { variance } = CONFIG.pointer;
      const total = width < 768 ? count.sm : count.md;
      const cx = width / 2;
      const cy = height / 2;
      const half = (gapOf(band, socketBar, plugBar) / 2) * spread;

      motes = [];
      for (let i = 0; i < total; i += 1) {
        // Signed, then bent back toward zero: the sign spreads them either side
        // of the middle and the power decides how tightly they crowd it.
        const u = Math.random() * 2 - 1;
        const side = u >= 0 ? 1 : -1;
        const hx = cx + side * Math.abs(u) ** bias * (width / 2) * reach;
        // Two rolls added: a triangular spread, densest along the join and
        // thinning out toward whichever bar is nearer.
        const hy = cy + (Math.random() + Math.random() - 1) * half;

        // Thrown outward — and the ones nearest the middle, the ones contact
        // actually happens on top of, are thrown hardest.
        const from = Math.min(1, Math.abs(hx - cx) / (width / 2 || 1));
        motes.push({
          hx,
          hy,
          r: dot.min + Math.random() * (dot.max - dot.min),
          ax: drift.amount * (0.4 + Math.random() * 0.6),
          ay: drift.amount * (0.4 + Math.random() * 0.6),
          fx: drift.speed * (0.6 + Math.random() * 0.8),
          fy: drift.speed * (0.6 + Math.random() * 0.8),
          px: Math.random() * TAU,
          py: Math.random() * TAU,
          dx: side * (0.75 + Math.random() * 0.25),
          dy: (Math.random() - 0.5) * 2 * lift,
          distance: distance * (0.35 + Math.random() * 0.65) * (1.5 - from),
          w: 1 + (Math.random() - 0.5) * 2 * variance,
          ox: 0,
          oy: 0,
        });
      }
    };

    const draw = (delta: number) => {
      ctx.clearRect(0, 0, width, height);
      if (motes.length === 0) return;

      const p = progressRef.current;
      const { seat } = CONFIG.scroll;
      const close = clamp01(seat > 0 ? p / seat : 1);
      const burst = clamp01(seat < 1 ? (p - seat) / (1 - seat) : 0);
      // Out fast, then coasting — the throw has no engine behind it.
      const thrown = 1 - (1 - burst) ** 2.4;

      const { color, opacity } = paletteRef.current;
      const { rest } = CONFIG.field;
      const alpha = opacity * (rest + (1 - rest) * close) * (1 - thrown);
      if (alpha <= 0.002) return;

      const { squeeze, gather } = CONFIG.burst;
      const { radius, strength, ease } = CONFIG.pointer;
      const wander = stillRef.current ? 0 : 1;
      const t = clock;
      const cx = width / 2;
      const cy = height / 2;
      // Roughly the shape of the bars' own easing, so the dust is pressed in at
      // the rate they are actually closing on it.
      const pressed = close ** 1.6;

      // Framerate-independent chase: the same pull per second at any fps.
      const follow = delta > 0 ? 1 - Math.exp(-ease * delta) : 0;
      const reachSq = radius * radius;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;

      // One path for the whole field: hundreds of motes, a single fill.
      ctx.beginPath();
      for (const mote of motes) {
        let x = mote.hx + Math.sin(t * mote.fx + mote.px) * mote.ax * wander;
        let y = mote.hy + Math.cos(t * mote.fy + mote.py) * mote.ay * wander;

        // Squeezed onto the join by the closing bars, then thrown off it.
        y += (cy - y) * pressed * squeeze;
        x += (cx - x) * pressed * gather;
        x += mote.dx * mote.distance * thrown;
        y += mote.dy * mote.distance * thrown;

        // The push is read off where the mote belongs, never off where it has
        // already been pushed to — otherwise it chases its own tail out of the
        // cursor's reach and oscillates on the way back in.
        let tx = 0;
        let ty = 0;
        if (pointerOn) {
          const ax = x - pointerX;
          const ay = y - pointerY;
          const away = ax * ax + ay * ay;
          if (away < reachSq) {
            const span = Math.sqrt(away) || 1;
            // Squared falloff: no visible ring where the influence ends.
            const falloff = 1 - span / radius;
            const push = (strength * falloff * falloff * mote.w) / span;
            tx = ax * push;
            ty = ay * push;
          }
        }
        mote.ox += (tx - mote.ox) * follow;
        mote.oy += (ty - mote.oy) * follow;

        const dx = x + mote.ox;
        const dy = y + mote.oy;
        ctx.moveTo(dx + mote.r, dy);
        ctx.arc(dx, dy, mote.r, 0, TAU);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    /** Asks for a frame. With reduced motion on, a single one is the whole show. */
    const kick = () => {
      if (disposed || raf !== 0 || !onScreen || !pageVisible) return;
      raf = requestAnimationFrame(frame);
    };

    function frame(now: number) {
      raf = 0;
      // Clamped so a backgrounded tab does not come back mid-jump.
      const delta = last === 0 ? 0 : Math.min(now - last, 64) / 1000;
      last = now;
      if (!stillRef.current) clock += delta;

      if (pointerOn) {
        const rect = canvas.getBoundingClientRect();
        pointerX = pointerClientX - rect.left;
        pointerY = pointerClientY - rect.top;
      }

      draw(delta);
      if (!stillRef.current) kick();
    }

    const pause = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    repaintRef.current = kick;

    measure();
    build();
    kick();

    const ro = new ResizeObserver(() => {
      if (!measure()) return;
      build();
      kick();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) kick();
        else pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(band);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) kick();
      else pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // On the window rather than on the canvas: the band is decoration and lets
    // every event through, so it never receives a pointer event of its own.
    const onPointerMove = (event: PointerEvent) => {
      // With motion off there is no loop to pick this up, and no push either.
      if (stillRef.current) return;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      pointerOn = true;
    };

    const onPointerGone = () => {
      pointerOn = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerGone);

    return () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerGone);
      repaintRef.current = () => {};
    };
  }, []);

  // ── The close ───────────────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const band = bandRef.current;
    const socketNeck = socketNeckRef.current;
    const plugNeck = plugNeckRef.current;
    const socketBar = socketBarRef.current;
    const plugBar = plugBarRef.current;
    if (!band || !socketNeck || !plugNeck || !socketBar || !plugBar) return;

    const glows = band.querySelectorAll<HTMLElement>("[data-glow]");
    const seam = band.querySelector<HTMLElement>("[data-seam]");
    if (!seam) return;

    /** What one half has to travel for the two to meet in the middle. */
    const travel = () =>
      (gapOf(band, socketBar, plugBar) + CONFIG.band.overlap) / 2;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const { seat, ease } = CONFIG.scroll;
      const { peak, rest, rise } = CONFIG.flare;
      // The run left once the two halves have met, split between the bloom
      // going up and the long settle back down to its resting glow.
      const after = 1 - seat;
      const up = after * rise;
      const down = after - up;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: band,
          start: CONFIG.scroll.start,
          end: CONFIG.scroll.end,
          // Plain `true`, not a number: ScrollSmoother already eases the page,
          // and a second lag on top of it reads as lost input.
          scrub: true,
          invalidateOnRefresh: true,
          // The canvas reads this rather than being driven by it — it is
          // already running a loop of its own for the drift.
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });

      // Three things are deliberate here.
      //
      // The markup is the *closed* state — a neck at full length with its bar
      // sitting at the end of it. Which makes the open state the one that has
      // to be described, and it is the pair below: the neck flattened against
      // the block it belongs to, and the bar pulled back over it by exactly
      // the length the neck is holding in the layout.
      //
      // `fromTo` rather than letting the tweens pick their start up from
      // wherever the parts happen to be: a refresh landing mid-close would
      // otherwise record a half-drawn neck as the open position, and the gap
      // would never come back on the way up.
      //
      // And every position spelled out rather than appended, because most of
      // these overlap. The timeline then runs exactly 1 long, which is the
      // same 0-1 the canvas reads its own two phases off.
      tl.fromTo(
        socketNeck,
        { scaleY: 0, transformOrigin: "50% 0%" },
        { scaleY: 1, ease, duration: seat },
        0,
      )
        .fromTo(
          socketBar,
          { y: () => -travel() },
          { y: 0, ease, duration: seat },
          0,
        )
        .fromTo(
          plugNeck,
          { scaleY: 0, transformOrigin: "50% 100%" },
          { scaleY: 1, ease, duration: seat },
          0,
        )
        .fromTo(
          plugBar,
          { y: () => travel() },
          { y: 0, ease, duration: seat },
          0,
        )
        .fromTo(
          glows,
          { opacity: 0 },
          { opacity: peak, ease: "power2.out", duration: up },
          seat,
        )
        .to(
          glows,
          { opacity: rest, ease: "power2.out", duration: down },
          seat + up,
        )
        .fromTo(
          seam,
          { opacity: 0, scaleX: 0.1 },
          { opacity: 1, scaleX: 1, ease: "power2.out", duration: up },
          seat,
        )
        .to(
          seam,
          { opacity: rest * 0.7, ease: "none", duration: down },
          seat + up,
        );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      // Nothing to scrub. The markup is already the closed state, so the only
      // thing to say is that the dust has been and gone — which is also what a
      // visitor with no JS at all is left looking at.
      gsap.set(glows, { opacity: CONFIG.flare.rest });
      progressRef.current = 1;
      repaintRef.current();

      return () => {
        progressRef.current = 0;
        repaintRef.current();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // A theme flip only changes what the next frame is painted with — and with
  // motion off there is no next frame, so ask for one.
  useEffect(() => {
    paletteRef.current = CONFIG.palette[theme];
    stillRef.current = reducedMotion;
    repaintRef.current();
  }, [theme, reducedMotion]);

  const { at, tri } = CONFIG.connector;

  return (
    <section
      ref={bandRef}
      aria-hidden="true"
      style={
        {
          "--bar-sm": `${CONFIG.band.bar.sm}px`,
          "--bar-md": `${CONFIG.band.bar.md}px`,
          "--gap-sm": `${CONFIG.band.gap.sm}px`,
          "--gap-md": `${CONFIG.band.gap.md}px`,
          "--tri-w-sm": `${tri.w.sm}px`,
          "--tri-w-md": `${tri.w.md}px`,
          "--tri-h-sm": `${tri.h.sm}px`,
          "--tri-h-md": `${tri.h.md}px`,
          // The notch is not a size of its own: it is the half of the triangle
          // that stands proud of the lower bar, so it is derived from it and
          // the two can never be cut to different shapes.
          "--notch-w": "calc(var(--tri-w) / 4)",
          "--notch-h": "calc(var(--tri-h) / 2)",
          // Half the gap each, so the two necks meet in the middle. Derived
          // for the same reason: the JS that offsets the bars works the travel
          // out of the gap too, and the two have to be the same number.
          "--overlap": `${CONFIG.band.overlap}px`,
          "--neck": "calc((var(--gap) + var(--overlap)) / 2)",
          "--glow": `${CONFIG.flare.size}px`,
          "--glow-blur": `${CONFIG.flare.blur}px`,
        } as CSSProperties
      }
      // The breakpoint picks which set of measurements is live. They are handed
      // in as inline variables and chosen by class, never set inline
      // themselves — an inline `--gap` would outrank the `md:` rule.
      //
      // Nothing is clipped here, and nothing needs to be: the necks are scaled
      // rather than moved so they never leave the band, and the dust is painted
      // into a canvas that already ends where the band does. Which leaves the
      // bars free to hang their outlines a pixel over each edge, where the two
      // blocks meet them.
      className="relative h-[calc(var(--bar)*2_+_var(--gap))] w-full [--bar:var(--bar-sm)] [--gap:var(--gap-sm)] [--tri-h:var(--tri-h-sm)] [--tri-w:var(--tri-w-sm)] md:[--bar:var(--bar-md)] md:[--gap:var(--gap-md)] md:[--tri-h:var(--tri-h-md)] md:[--tri-w:var(--tri-w-md)]"
    >
      {/* ── The upper half: the end of the block above, reaching down. ── */}
      <div className="absolute inset-x-0 top-0 z-10">
        {/* The neck. Flat against the block at rest and drawn out to full
            length by the close — the rails it carries are the block's own,
            which is the whole reason the connector reads as part of it. */}
        <div ref={socketNeckRef} className={`h-[var(--neck)] ${NECK}`} />

        {/* `z-10` is against its own neck, not against the other half — see
            the note on the lower bar, which is the one that needs it. Kept on
            both so the two halves cannot drift out of step. */}
        <div
          ref={socketBarRef}
          className={`relative z-10 h-[var(--bar)] ${PLATE}`}
        >
          {/* Shape layer, kept free of anything else so the rim traces the
              silhouette and haloes nothing. */}
          <div className="absolute inset-0" style={{ filter: RIM }}>
            <span
              className="absolute inset-0 bg-background"
              style={{ clipPath: NOTCHED }}
            />
          </div>
        </div>
      </div>

      {/* ── The lower half: the start of the block below, reaching up. ── */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        {/* `z-10` is load-bearing here, and it is the one asymmetry between the
            two halves worth knowing about.

            A transformed element paints with the positioned ones, in tree
            order — and the neck is transformed the moment GSAP touches it. In
            the upper half the neck comes first, so its bar covers it and all is
            well. Down here the neck comes *after* its bar, so without this it
            would lay its own background over the bar's bottom edge: the very
            line that says where the connector ends. At the fractional offsets a
            scrub runs on it covers it by part of a pixel, differently every
            frame, which is exactly what a shimmer is. */}
        <div
          ref={plugBarRef}
          className={`relative z-10 h-[var(--bar)] ${PLATE}`}
        >
          <div className="absolute inset-0" style={{ filter: RIM }}>
            <span className="absolute inset-0 bg-background" />
          </div>

          {/* The current, running out along the join from the middle. It lives
              on this half rather than the other for z-order alone: this one is
              on top, and the line has to cross the rim the two edges meet on
              rather than end up behind it. It only ever shows from the moment
              of contact, by which time the triangles are covering the mouths it
              would otherwise be drawn across. */}
          <span
            data-seam
            className="pointer-events-none absolute inset-x-0 -top-px h-px bg-border opacity-0"
            style={{ boxShadow: "0 0 12px var(--foreground)" }}
          />

          {at.map((position) => (
            <Fragment key={position}>
              {/* Behind the triangle, and centred on it rather than on the bar:
                  the glow belongs to the point of contact, so it travels up
                  with the triangle and arrives where the two meet. */}
              {/* <span
                data-glow
                className="pointer-events-none absolute h-[var(--glow)] w-[var(--glow)] rounded-full bg-foreground opacity-0 "
                style={{
                  left: pct(position),
                  top: 0,
                  transform: "translate(-50%,-50%)",
                }}
              /> */}
              {/* Half in, half out. The half standing proud is what the notch
                  above is cut to take, so once they close the whole triangle
                  sits dead centre of the block the two bars have become. */}
              <span
                className="absolute h-[var(--tri-h)] w-[var(--tri-w)] bg-foreground"
                style={{
                  left: pct(position),
                  top: "calc(var(--tri-h) * -0.5)",
                  transform: "translateX(-50%)",
                  clipPath: TRIANGLE,
                }}
              />
            </Fragment>
          ))}
        </div>

        <div ref={plugNeckRef} className={`h-[var(--neck)] ${NECK}`} />
      </div>

      {/* Last, and over everything: by the time the burst goes off the two
          halves have closed and there is no gap left to see it through, so the
          dust is thrown across the face of the connector rather than behind it.
          Which is the right reading anyway — it is what the contact throws off,
          not something the hardware is standing in front of.

          Full-bleed, so the burst can leave the column. It needs no clipping to
          stay put: motes are painted into the canvas's own bitmap, and that
          ends exactly where the band does. */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />
    </section>
  );
}
