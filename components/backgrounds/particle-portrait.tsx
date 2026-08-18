"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type PortraitProfile = {
  /** Backing-store density. Mobile panels commonly need the third pixel. */
  maxDpr: number;
  art: { scale: number; offsetX: number; offsetY: number };
  sampling: {
    step: number;
    alpha: number;
    ink: number;
    jitter: number;
    max: number;
  };
  dot: { min: number; max: number };
  drift: { amount: number; speed: number };
  pointer: {
    radius: number;
    strength: number;
    ease: number;
    variance: number;
  };
  settle: { duration: number; stagger: number; spread: number };
};

/**
 * The drawing, rebuilt as a field of slowly drifting dots.
 *
 * The PNG is never shown. It is painted once into an offscreen buffer, read
 * back pixel by pixel, and every dark pixel on the sampling grid becomes a
 * particle that wanders a few px around the spot it came from — so the portrait
 * reads as a still image that is quietly breathing. The cursor pushes the ones
 * it passes over out of the way, and they drift back once it moves on.
 *
 * Everything worth nudging lives in CONFIG. Mobile has its own canvas inputs
 * so a small portrait does not inherit desktop's looser sampling and motion.
 */
const CONFIG = {
  /** Source art. Dark ink on a light — or transparent — ground is what samples well. */
  src: "/hero-illustration.png",
  /** Known up front so sections below do not shift when the PNG finishes loading. */
  aspectRatio: "961 / 1108",
  maxDpr: 2,

  /** Where the canvas sits inside its section. */
  layout: {
    /**
     * Desktop is width-driven: the art keeps this width and its own aspect
     * ratio supplies the height of both the canvas and its section. The
     * available-width guard only matters before the mobile layout takes over.
     */
    widthDesktop: "min(28rem, calc(100% - 3rem))",
    /**
     * On mobile the canvas remains absolutely positioned, so its wrapper owns
     * the height of the complete drawing band.
     */
    heightMobile: "42vh",
    /** Nudge off dead centre. "-40px" slides the figure left. */
    shift: "0px",
    /** How far it floats above the bottom of the hero. */
    lift: "0px",
    /**
     * Where the dots start dissolving, measured down the canvas's own space.
     * 100% = no fade, the drawing simply ends on the rule below it.
     */
    fadeFrom: "100%",
  },

  /**
   * Framing of the art inside the canvas, before any of it is clipped. The
   * canvas takes the art's own aspect ratio once it loads, so `scale` 1 fills
   * it exactly and anything higher crops in. The current PNG is trimmed right
   * to the shoulders, so 1 is the honest value. Offsets are fractions of the
   * box: a negative `offsetX` pulls the figure left, into view.
   */
  art: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },

  sampling: {
    /**
     * Distance between samples, in CSS px — the sharpness dial, and only
     * meaningful next to `dot` below. What matters is how much of each cell a
     * dot covers: at step 4 with the old radii it was about a sixth, which is
     * why the drawing read as haze. At 2.5 with the radii below it is three
     * quarters, so the strokes hold together. Halving this quadruples the
     * count, so raise `max` alongside it.
     */
    step: 3,
    /**
     * 0-255. Skips transparent pixels. This is the gate that does the work for
     * the current art: it is ink on a transparent ground, so low values keep
     * the soft edge of every stroke and the outlines stay continuous.
     */
    alpha: 40,
    /**
     * 0-255 luminance, for art drawn on a light ground instead. Inert for the
     * current PNG — its ink is pure black wherever it is opaque at all — but
     * it is what makes a white-background export work without other changes.
     */
    ink: 150,
    /**
     * Share of a step the samples are knocked off the grid by. Keeps it from
     * looking machine-ruled; past ~0.3 it starts smearing the thin strokes.
     */
    jitter: 0.2,
    /** Safety valve. Must stay above what `step` actually yields, or the field is thinned. */
    max: 14000,
  },

  /**
   * Dot radius in CSS px, picked per dot inside this range. Read it against
   * `step`: what the eye actually judges is the share of each cell a dot
   * covers, `π·r² / step²`. Around 30% is an open stipple, 75% reads as a
   * continuous line, past 100% the strokes go solid. The finest strokes in the
   * face are ~4px wide, so much below 0.8 and they break into beads.
   */
  dot: { min: 0.95, max: 1.5 },

  /** One entry per theme, same shape as the hero background's palette. */
  palette: {
    light: { color: "#000000", opacity: 0.85 },
    dark: { color: "#ffffff", opacity: 0.75 },
  },

  /**
   * The wander. `amount` is px travelled, `speed` is roughly radians per second.
   * The finest strokes in the face are about 4px wide at this size, so anything
   * near that blurs the drawing into a cloud — 6 did exactly that. Keep it
   * small and let `speed` carry the slowness.
   */
  drift: { amount: 3, speed: 1 },

  /**
   * Cursor push. The dots the pointer passes over slide out of its way and
   * drift back once it moves on. The field it applies is anchored to where
   * each dot belongs, not to where it currently is, so they settle instead of
   * chasing themselves in circles.
   */
  pointer: {
    /** How far the influence reaches, in px. */
    radius: 130,
    /** How far a dot right under the cursor is pushed. Negative pulls them in instead. */
    strength: 28,
    /** How fast they chase it. Higher = snappier, lower = more syrupy. */
    ease: 6,
    /** How much dots differ in how hard they react. 0 = all the same. */
    variance: 0.35,
  },

  /** Intro: the dots swim in from a scatter and settle onto the drawing. */
  settle: {
    /**
     * The whole intro, in seconds — from the first dot moving to the last one
     * landing. This is the dial for "faster/slower entrance"; `stagger` only
     * decides how that time is divided up.
     */
    duration: 1.2,
    /**
     * Share of `duration` spent handing out head starts. 0 = every dot moves
     * at once and the drawing snaps into place; 0.6 = a long trickle.
     */
    stagger: 0.45,
    /** How far from home the dots begin, in px. */
    spread: 120,
  },

  /**
   * Inputs used below Tailwind's `lg` breakpoint. They are intentionally
   * denser and steadier so the facial strokes survive at phone sizes.
   */
  mobile: {
    maxDpr: 3,
    art: { scale: 1, offsetX: 0, offsetY: 0 },
    sampling: {
      step: 2,
      alpha: 28,
      ink: 165,
      jitter: 0.08,
      max: 24000,
    },
    dot: { min: 0.8, max: 1.15 },
    drift: { amount: 1.15, speed: 0.8 },
    pointer: { radius: 90, strength: 14, ease: 7, variance: 0.2 },
    settle: { duration: 1, stagger: 0.35, spread: 70 },
  } satisfies PortraitProfile,
};

const DESKTOP_PROFILE = {
  maxDpr: CONFIG.maxDpr,
  art: CONFIG.art,
  sampling: CONFIG.sampling,
  dot: CONFIG.dot,
  drift: CONFIG.drift,
  pointer: CONFIG.pointer,
  settle: CONFIG.settle,
} satisfies PortraitProfile;

const TAU = Math.PI * 2;

type Dot = {
  /** Where the pixel it came from sits. */
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
 * Reads the art at the size it will be painted, so dot spacing stays constant
 * no matter how large the canvas gets.
 */
function sample(
  image: HTMLImageElement,
  width: number,
  height: number,
  profile: PortraitProfile,
): Dot[] {
  const buffer = document.createElement("canvas");
  buffer.width = width;
  buffer.height = height;

  const bctx = buffer.getContext("2d", { willReadFrequently: true });
  if (!bctx) return [];

  const fit =
    Math.min(width / image.width, height / image.height) * profile.art.scale;
  const dw = image.width * fit;
  const dh = image.height * fit;
  bctx.drawImage(
    image,
    (width - dw) / 2 + profile.art.offsetX * width,
    (height - dh) / 2 + profile.art.offsetY * height,
    dw,
    dh,
  );

  const { data } = bctx.getImageData(0, 0, width, height);
  const { step, ink, alpha, jitter } = profile.sampling;
  const { min, max } = profile.dot;
  const { amount, speed } = profile.drift;
  const { spread } = profile.settle;
  const { variance } = profile.pointer;
  const dots: Dot[] = [];

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const i = (Math.floor(y) * width + Math.floor(x)) * 4;

      // Transparent ground first, then light ground: both kinds of PNG work.
      if (data[i + 3] < alpha) continue;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum > ink) continue;

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

  if (dots.length <= profile.sampling.max) return dots;

  // Denser than the budget: keep an even spread of what was found.
  const stride = dots.length / profile.sampling.max;
  const thinned: Dot[] = [];
  for (let i = 0; i < dots.length; i += stride) {
    thinned.push(dots[Math.floor(i)]);
  }
  return thinned;
}

export function ParticlePortrait({
  aspectRatio = CONFIG.aspectRatio,
  className = "",
  src = CONFIG.src,
}: {
  aspectRatio?: string;
  className?: string;
  src?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  // The loop reads these rather than being torn down when the theme flips.
  const paletteRef = useRef(CONFIG.palette[theme]);
  const stillRef = useRef(reducedMotion);
  const repaintRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    const desktopMedia = window.matchMedia("(min-width: 64rem)");
    let profile: PortraitProfile = desktopMedia.matches
      ? DESKTOP_PROFILE
      : CONFIG.mobile;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let raf = 0;
    let clock = 0;
    let last = 0;
    let ready = false;
    let onScreen = true;
    let pageVisible = !document.hidden;
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
      const dpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
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
      const { duration, stagger } = profile.settle;
      const { radius, strength, ease } = profile.pointer;
      const wander = stillRef.current ? 0 : 1;
      const t = clock;

      // `duration` is the whole intro, so the part left for a single dot to
      // travel is what remains once the head starts are handed out.
      const travel = duration * (1 - stagger);
      const lead = duration * stagger;

      // Framerate-independent chase: the same pull per second at any fps.
      const follow = delta > 0 ? 1 - Math.exp(-ease * delta) : 0;
      const reach = radius * radius;

      ctx.fillStyle = color;
      ctx.globalAlpha =
        opacity * (duration > 0 ? Math.min(1, t / duration) : 1);

      // One path for the whole field: thousands of dots, a single fill.
      ctx.beginPath();
      for (const dot of dots) {
        const p = travel > 0 ? (t - dot.delay * lead) / travel : 1;
        const eased = p <= 0 ? 0 : p >= 1 ? 1 : 1 - (1 - p) ** 3;
        const x =
          dot.sx +
          (dot.hx - dot.sx) * eased +
          Math.sin(t * dot.fx + dot.px) * dot.ax * wander;
        const y =
          dot.sy +
          (dot.hy - dot.sy) * eased +
          Math.cos(t * dot.fy + dot.py) * dot.ay * wander;

        // The push is read off where the dot belongs, never off where it has
        // already been pushed to — otherwise it would chase its own tail out
        // of the cursor's reach and oscillate on the way back in.
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
        clock = profile.settle.duration;
      } else {
        clock += delta;
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
      if (disposed || raf !== 0 || !ready || !onScreen || !pageVisible) return;
      raf = requestAnimationFrame(frame);
    };

    const pause = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    const build = () => {
      if (!ready || width === 0) return;
      dots = sample(image, width, height, profile);
    };

    const start = () => {
      if (disposed || ready) return;
      ready = true;
      // The box takes the art's own ratio, so swapping the drawing for a
      // different crop cannot letterbox it inside a shape it does not fill.
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        canvas.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
      }
      measure();
      build();
      kick();
    };

    repaintRef.current = kick;

    const onProfileChange = () => {
      profile = desktopMedia.matches ? DESKTOP_PROFILE : CONFIG.mobile;
      measure();
      build();
      kick();
    };
    desktopMedia.addEventListener("change", onProfileChange);

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
    io.observe(wrap);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) kick();
      else pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // On the window rather than the canvas: the whole overlay is
    // `pointer-events-none` so the links underneath stay clickable, which
    // means it never receives a pointer event of its own.
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

    image.decoding = "async";
    image.addEventListener("load", start, { once: true });
    image.src = src;
    if (image.complete) start();

    return () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      desktopMedia.removeEventListener("change", onProfileChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerGone);
      image.removeEventListener("load", start);
      repaintRef.current = () => {};
    };
  }, [aspectRatio, src]);

  // A theme flip only changes what the next frame is painted with — and with
  // motion off there is no next frame, so ask for one.
  useEffect(() => {
    paletteRef.current = CONFIG.palette[theme];
    stillRef.current = reducedMotion;
    repaintRef.current();
  }, [theme, reducedMotion]);

  const fade = `linear-gradient(to bottom, #000 ${CONFIG.layout.fadeFrom}, transparent 100%)`;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none relative z-[5] h-[var(--portrait-height)] min-h-0 w-full flex-1 overflow-hidden lg:flex lg:h-auto lg:flex-none lg:justify-center ${className}`.trim()}
      style={
        {
          // A class rather than an inline height lets `lg:h-auto` switch the
          // desktop wrapper to the canvas's natural, width-driven height.
          "--portrait-height": CONFIG.layout.heightMobile,
          maskImage: fade,
          WebkitMaskImage: fade,
        } as CSSProperties
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute bottom-[var(--portrait-lift)] left-1/2 h-full max-w-full -translate-x-1/2 lg:relative lg:bottom-auto lg:left-auto lg:h-auto lg:w-[var(--portrait-width)] lg:translate-x-0"
        style={
          {
            "--portrait-lift": CONFIG.layout.lift,
            "--portrait-width": CONFIG.layout.widthDesktop,
            // The image load confirms this value, but publishing the known
            // ratio now prevents downstream scroll positions from shifting.
            aspectRatio,
            marginLeft: CONFIG.layout.shift,
          } as CSSProperties
        }
      />
    </div>
  );
}
