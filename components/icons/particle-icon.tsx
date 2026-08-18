"use client";

import { useEffect, useRef } from "react";
import type { BrandMark } from "@/components/icons/brand";
import { useTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * A brand mark rebuilt as a field of drifting dots.
 *
 * Same trick as `ParticlePortrait`, aimed at something the size of an icon: the
 * path is filled once into an offscreen buffer, read back pixel by pixel, and
 * every covered sample on the grid becomes a particle that wanders a little
 * around the spot it came from. The mark itself is never painted on the visible
 * canvas.
 *
 * Two things differ from the portrait, both because of the scale. The buffer is
 * rasterised at `supersample`x the display size, because at 64px a stroke of
 * the mark is only a few px wide and gating a 1:1 raster would lose it to
 * antialiasing. And the hover reaction is driven by the whole card rather than
 * the icon's own box - a 64px target is too small to aim at, so the dots loosen
 * while the cursor is anywhere on the link that contains them.
 *
 * Everything worth nudging lives in CONFIG.
 */
const CONFIG = {
  /** Display size in CSS px. Every number below is tuned against this. */
  size: 64,
  maxDpr: 2,

  /** How much of the box the mark fills. Offsets are fractions of the box. */
  art: { scale: 0.94, offsetX: 0, offsetY: 0 },

  sampling: {
    /**
     * Distance between samples, in CSS px - the sharpness dial, and only
     * meaningful next to `dot` below. What the eye judges is the share of each
     * cell a dot covers, `pi*r^2 / step^2`. At 1.5 with the radii below that is
     * around 80%: dense enough that the mark still reads as a logo, open enough
     * that the grain shows. Halving this quadruples the count, so raise `max`
     * alongside it - though at the sizes here the grid tops out well under it.
     */
    step: 1.5,
    /**
     * The buffer is rasterised at this multiple of the display size before it
     * is read back, so each sample gets a clean inside/outside answer instead
     * of a soft one. Past 4 it costs memory for accuracy nothing can see.
     */
    supersample: 3,
    /** 0-255. The mark is filled opaque, so this only trims the soft edge. */
    alpha: 128,
    /**
     * Share of a step the samples are knocked off the grid by. Keeps it from
     * looking machine-ruled; past ~0.4 it starts smearing the thin strokes.
     */
    jitter: 0.28,
    /** Safety valve. Must stay above what `step` yields, or the field is thinned. */
    max: 2600,
  },

  /**
   * Dot radius in CSS px, picked per dot inside this range. Read against
   * `step`: around 30% cell coverage is an open stipple, 75% reads as a
   * continuous line, past 100% the mark goes solid.
   */
  dot: { min: 0.55, max: 0.95 },

  /**
   * One entry per theme, same shape as the portrait's palette. This is
   * `--foreground` held back a little; taking the opacity down toward 0.45
   * lands on the `--subtle` tone the flat icons used.
   */
  palette: {
    light: { color: "#0a0a0a", opacity: 0.72 },
    dark: { color: "#ededed", opacity: 0.66 },
  },

  /**
   * The idle wander. `amount` is px travelled, `speed` roughly radians per
   * second. The thinnest stroke of these marks is ~4px at this size, so keep
   * `amount` well under that or the mark reads as a cloud rather than a logo.
   */
  drift: { amount: 0.7, speed: 1.1 },

  /**
   * Cursor push, for when the pointer is actually over the icon. The field is
   * anchored to where each dot belongs, never to where it has already been
   * pushed - otherwise a dot chases its own tail out of reach and oscillates on
   * the way back in.
   */
  pointer: {
    /** How far the influence reaches, in px. */
    radius: 58,
    /** How far a dot right under the cursor is pushed. Negative pulls them in. */
    strength: 15,
    /** How fast they chase it. Higher = snappier, lower = more syrupy. */
    ease: 7,
    /** How much dots differ in how hard they react. 0 = all the same. */
    variance: 0.35,
  },

  /**
   * What hovering the card does, as multipliers on `drift` - so 1 / 1 is "hover
   * changes nothing". The speed multiplier drives a separate phase clock, so
   * arriving and leaving never makes the dots jump.
   */
  hover: { amount: 3.4, speed: 1.5, ease: 4 },

  /**
   * Intro: the dots swim in from a scatter and settle onto the mark. The clock
   * only runs while the canvas is on screen, so this plays on the way down the
   * page rather than being over before the section is reached.
   */
  settle: {
    /** The whole intro, in seconds, from the first dot moving to the last landing. */
    duration: 0.9,
    /** Share of `duration` spent handing out head starts. 0 = the mark snaps in. */
    stagger: 0.45,
    /** How far from home the dots begin, in px. */
    spread: 26,
  },
};

const TAU = Math.PI * 2;

type Dot = {
  /** Where the sample it came from sits. */
  hx: number;
  hy: number;
  /** Where it starts, before it settles. */
  sx: number;
  sy: number;
  r: number;
  /** Head start in the intro, 0-1. Scaled by the settle config at draw time. */
  delay: number;
  /** Drift amplitude and frequency per axis, so the path is never a clean circle. */
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  /** How hard this one reacts to the cursor. */
  w: number;
  /** Where the cursor currently has it, relative to home. The only mutable state. */
  ox: number;
  oy: number;
};

/**
 * Fills the mark into a supersampled buffer and turns every covered sample on
 * the grid into a dot. Sampling happens in CSS px, so dot spacing stays
 * constant however large the icon is asked to be.
 */
function sample(mark: BrandMark, width: number, height: number): Dot[] {
  const ss = Math.max(1, Math.round(CONFIG.sampling.supersample));
  const buffer = document.createElement("canvas");
  buffer.width = Math.max(1, Math.round(width * ss));
  buffer.height = Math.max(1, Math.round(height * ss));

  const bctx = buffer.getContext("2d", { willReadFrequently: true });
  if (!bctx) return [];

  // The viewBox is square, so one factor fits both axes. `ss` first, then the
  // layout in CSS px, then the viewBox - so the offsets stay in the units the
  // config documents.
  const fit = (Math.min(width, height) / mark.viewBox) * CONFIG.art.scale;
  const drawn = mark.viewBox * fit;
  bctx.scale(ss, ss);
  bctx.translate(
    (width - drawn) / 2 + CONFIG.art.offsetX * width,
    (height - drawn) / 2 + CONFIG.art.offsetY * height,
  );
  bctx.scale(fit, fit);
  bctx.fillStyle = "#000";
  // Nonzero winding, which is what the SVG default gives these paths - it is
  // what knocks the envelope's chevron and LinkedIn's letters back out.
  bctx.fill(new Path2D(mark.path));

  const { data } = bctx.getImageData(0, 0, buffer.width, buffer.height);
  const { step, alpha, jitter } = CONFIG.sampling;
  const { min, max } = CONFIG.dot;
  const { amount, speed } = CONFIG.drift;
  const { spread } = CONFIG.settle;
  const { variance } = CONFIG.pointer;
  const dots: Dot[] = [];

  for (let y = step / 2; y < height; y += step) {
    const by = Math.min(buffer.height - 1, Math.floor(y * ss));
    for (let x = step / 2; x < width; x += step) {
      const bx = Math.min(buffer.width - 1, Math.floor(x * ss));
      if (data[(by * buffer.width + bx) * 4 + 3] < alpha) continue;

      const hx = x + (Math.random() - 0.5) * step * jitter;
      const hy = y + (Math.random() - 0.5) * step * jitter;
      const angle = Math.random() * TAU;
      const distance = spread * (0.35 + Math.random() * 0.65);

      dots.push({
        hx,
        hy,
        sx: hx + Math.cos(angle) * distance,
        sy: hy + Math.sin(angle) * distance,
        r: min + Math.random() * (max - min),
        delay: Math.random(),
        ax: amount * (0.4 + Math.random() * 0.6),
        ay: amount * (0.4 + Math.random() * 0.6),
        fx: speed * (0.6 + Math.random() * 0.8),
        fy: speed * (0.6 + Math.random() * 0.8),
        px: Math.random() * TAU,
        py: Math.random() * TAU,
        w: 1 + (Math.random() - 0.5) * 2 * variance,
        ox: 0,
        oy: 0,
      });
    }
  }

  if (dots.length <= CONFIG.sampling.max) return dots;

  // Denser than the budget: keep an even spread of what was found.
  const stride = dots.length / CONFIG.sampling.max;
  const thinned: Dot[] = [];
  for (let i = 0; i < dots.length; i += stride) {
    thinned.push(dots[Math.floor(i)]);
  }
  return thinned;
}

export function ParticleIcon({
  mark,
  label,
  size = CONFIG.size,
  className = "",
}: {
  mark: BrandMark;
  /** Named for assistive tech, since the canvas itself says nothing. */
  label: string;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  // The loop reads these rather than being torn down when the theme flips.
  const paletteRef = useRef(CONFIG.palette[theme]);
  const stillRef = useRef(reducedMotion);
  const repaintRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A 64px icon is too small to aim at, so the link around it is what the
    // hover reaction listens to. Falling back to the canvas keeps the component
    // usable on its own, outside a card.
    const host = canvas.closest("a, button") ?? canvas;

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let raf = 0;
    /** Real seconds on screen - drives the intro. */
    let clock = 0;
    /** Excited seconds - drives the wander, so a hover cannot make it jump. */
    let phase = 0;
    let excite = 0;
    let last = 0;
    let onScreen = true;
    let pageVisible = !document.hidden;
    let hoverOn = false;
    let disposed = false;

    // Kept in viewport coordinates and resolved against the canvas once per
    // frame, so the dots also react when the page scrolls under a still cursor.
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
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      if (w === width && h === height && dpr === pixelRatio) return false;

      width = w;
      height = h;
      pixelRatio = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const draw = (delta: number) => {
      ctx.clearRect(0, 0, width, height);
      if (dots.length === 0) return;

      const { color, opacity } = paletteRef.current;
      const { duration, stagger } = CONFIG.settle;
      const { radius, strength, ease } = CONFIG.pointer;
      const wander = stillRef.current ? 0 : 1;
      const swell = 1 + excite * (CONFIG.hover.amount - 1);

      // `duration` is the whole intro, so the part left for a single dot to
      // travel is what remains once the head starts are handed out.
      const travel = duration * (1 - stagger);
      const lead = duration * stagger;

      // Framerate-independent chase: the same pull per second at any fps.
      const follow = delta > 0 ? 1 - Math.exp(-ease * delta) : 0;
      const reach = radius * radius;

      ctx.fillStyle = color;
      ctx.globalAlpha =
        opacity * (duration > 0 ? Math.min(1, clock / duration) : 1);

      // One path for the whole field: a couple of thousand dots, a single fill.
      ctx.beginPath();
      for (const dot of dots) {
        const p = travel > 0 ? (clock - dot.delay * lead) / travel : 1;
        const eased = p <= 0 ? 0 : p >= 1 ? 1 : 1 - (1 - p) ** 3;
        const x =
          dot.sx +
          (dot.hx - dot.sx) * eased +
          Math.sin(phase * dot.fx + dot.px) * dot.ax * swell * wander;
        const y =
          dot.sy +
          (dot.hy - dot.sy) * eased +
          Math.cos(phase * dot.fy + dot.py) * dot.ay * swell * wander;

        // The push is read off where the dot belongs, never off where it has
        // already been pushed to.
        let tx = 0;
        let ty = 0;
        if (pointerOn) {
          const dx = x - pointerX;
          const dy = y - pointerY;
          const away = dx * dx + dy * dy;
          if (away < reach) {
            const distance = Math.sqrt(away) || 1;
            // Squared falloff: no visible ring where the influence ends.
            const falloff = 1 - distance / radius;
            const push = (strength * falloff * falloff * dot.w) / distance;
            tx = dx * push;
            ty = dy * push;
          }
        }
        dot.ox += (tx - dot.ox) * follow;
        dot.oy += (ty - dot.oy) * follow;

        const cx = x + dot.ox;
        const cy = y + dot.oy;
        ctx.moveTo(cx + dot.r, cy);
        ctx.arc(cx, cy, dot.r, 0, TAU);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      // Clamped so a backgrounded tab does not come back mid-jump.
      const delta = last === 0 ? 0 : Math.min(now - last, 64) / 1000;
      last = now;

      if (stillRef.current) {
        clock = CONFIG.settle.duration;
        excite = 0;
      } else {
        clock += delta;
        excite +=
          ((hoverOn ? 1 : 0) - excite) *
          (1 - Math.exp(-CONFIG.hover.ease * delta));
        phase += delta * (1 + excite * (CONFIG.hover.speed - 1));
      }

      if (pointerOn) {
        const rect = canvas.getBoundingClientRect();
        pointerX = pointerClientX - rect.left;
        pointerY = pointerClientY - rect.top;
      }

      draw(delta);
      if (!stillRef.current) kick();
    };

    /** Asks for a frame. With reduced motion on, a single one is the whole show. */
    const kick = () => {
      if (disposed || raf !== 0 || !onScreen || !pageVisible) return;
      raf = requestAnimationFrame(frame);
    };

    const pause = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    const build = () => {
      if (width === 0) return;
      dots = sample(mark, width, height);
    };

    repaintRef.current = kick;

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
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) kick();
      else pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // On the window rather than the canvas: the canvas sits behind the card's
    // own hit area and never receives a pointer event of its own.
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

    const onEnter = () => {
      hoverOn = true;
    };

    const onLeave = () => {
      hoverOn = false;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerGone);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    // Keyboard tabbing gets the same reaction as a hover.
    host.addEventListener("focusin", onEnter);
    host.addEventListener("focusout", onLeave);

    measure();
    build();
    kick();

    return () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerGone);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("focusin", onEnter);
      host.removeEventListener("focusout", onLeave);
      repaintRef.current = () => {};
    };
  }, [mark]);

  // A theme flip only changes what the next frame is painted with - and with
  // motion off there is no next frame, so ask for one.
  useEffect(() => {
    paletteRef.current = CONFIG.palette[theme];
    stillRef.current = reducedMotion;
    repaintRef.current();
  }, [theme, reducedMotion]);

  return (
    <span className={`inline-flex ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none block"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
