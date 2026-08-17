"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The keyboard, rebuilt as a field of slowly drifting dots.
 *
 * Same effect as the hero's portrait — the PNG is painted once into an
 * offscreen buffer, read back pixel by pixel, and every sample that clears the
 * gate becomes a particle that wanders a few px around the spot it came from,
 * with the cursor pushing aside the ones it passes over.
 *
 * What is different is how a sample is judged. The portrait is ink on nothing,
 * so a pixel is either part of the drawing or it is not. This is a photograph:
 * ~85% of it is opaque, and taking all of it would paint a solid slab. So the
 * dots are sized by tone instead — the lit edges and legends of the keycaps
 * get the fat ones, the black case falls away to nothing — and the keyboard
 * comes out as a line drawing of itself, every cap outlined and every legend
 * readable. That is one pair of numbers in `tone`, and swapping them reads the
 * art by its ink instead.
 *
 * Legibility at that scale is a three-number balance, and it is the thing to
 * hold on to when retuning: `sampling.step` sets how fine the grid is, `dot`
 * has to stay under it or the letters close up into blobs, and
 * `drift.amount` has to stay under *that* or they smear as they wander.
 *
 * Everything worth nudging lives in CONFIG. Nothing below it needs to be
 * touched to retune the effect.
 */
const CONFIG = {
  /** Source art. Anything cut out against a transparent ground samples cleanly. */
  src: "/keyboard.png",

  /**
   * Where the canvas sits. Unlike the hero's — which fills whatever height the
   * headline leaves over — this one is in flow: it is centred in its band by
   * `margin-inline: auto` across and by equal `padY` up and down, so the band
   * is exactly the art plus that padding, whatever size the art is.
   */
  layout: {
    /**
     * How wide the drawing is allowed to get; its height follows the art's
     * ratio. This is also a detail dial, and the cheapest one: the art is
     * sampled at the size it is painted, so a wider canvas resolves the
     * legends out of more pixels. 1100 is about as far as it goes before the
     * 1200px frame's own padding starts clipping it.
     */
    width: "min(80%, 1100px)",
    /**
     * Air above and below the drawing, and the same on both sides on purpose:
     * this is what centres it in its band. A viewport-relative middle value so
     * it opens up on a wide screen without needing a breakpoint of its own.
     */
    padY: "clamp(3rem, 2vw, 5rem)",
    /** Nudge off dead centre. "-40px" slides the keyboard left. */
    shift: "0px",
    /**
     * Where the dots start dissolving, measured down the band — padding
     * included, since the mask covers the whole box. Off at 100%, which is
     * what `padY` wants: a fade only reads as a fade when the art runs into
     * the edge it is dissolving against. With air below it instead, it just
     * thins out the bottom row of keys and the drawing looks off-centre.
     */
    fadeFrom: "100%",
    /**
     * Holds the band's height before the art loads, so nothing under it jumps.
     * Replaced by the PNG's own ratio the moment it arrives — only worth
     * touching if `src` changes shape.
     */
    ratio: "1962 / 801",
  },

  /**
   * Framing of the art inside the canvas, before any of it is clipped. The
   * canvas takes the art's own aspect ratio once it loads, so `scale` 1 fills
   * it exactly and anything higher crops in. Offsets are fractions of the box:
   * a negative `offsetX` pulls the keyboard left.
   */
  art: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },

  sampling: {
    /**
     * Distance between samples, in CSS px — *the* detail dial. What it has to
     * clear is the smallest thing you want to read: a key legend is about 8px
     * tall on a 1100px canvas and its strokes are barely one, so at 2 a letter
     * gets four rows of dots to draw itself with and comes out legible. At 5
     * it had one and a half, which is why the caps read as blocks. Going finer
     * still works — 1.5 is crisper — but the count goes up with the square, so
     * check it against `max`.
     */
    step: 3.5,
    /**
     * Reads the mean of the whole cell instead of the one pixel under the
     * sample point. Costs a pass over every pixel once per resize, and buys
     * the detail that makes this legible: a stroke thinner than `step` still
     * registers, as a dimmer and smaller dot rather than as nothing at all.
     * Point sampling instead comes out fractionally crisper, at the price of
     * dropping thin rims wherever the grid happens to fall between them.
     */
    average: true,
    /** 0-255. Skips the transparent ground the keyboard was cut out of. */
    alpha: 40,
    /**
     * Share of a step the samples are knocked off the grid by. Keeps it from
     * looking machine-ruled. At this step it is a fifth of a pixel, so it is
     * doing very little; it earns its keep again if you go back to a coarse
     * grid, and past ~0.3 there it starts eating the gaps between the caps.
     */
    jitter: 0.2,
    /**
     * Perf ceiling, and the trap when you lower `step`: the field is thinned
     * to an even spread of this many the moment it is exceeded, which quietly
     * undoes the detail you just asked for. The current settings land near
     * 24k on a full-width canvas, so this is roughly a 60% margin.
     */
    max: 40000,
  },

  /**
   * How brightness picks a dot size. `from` is the luminance (0-255) that
   * draws the smallest dot, `to` the one that draws the largest, and
   * everything between is a ramp across `dot` below.
   *
   * With `to` above `from` — the case here — the art is read by its highlights:
   * the lit keycaps survive and the black chassis drops out under `cut`. Put
   * `to` *below* `from` and it reads by its ink instead, which is what a line
   * drawing on white wants. Lowering `from` brings the chassis back as haze.
   */
  tone: {
    from: 75,
    to: 195,
    /** Bends the ramp. >1 holds the mid-tones back, <1 brings them forward. */
    gamma: 1.1,
    /** Weight below which a sample is dropped rather than drawn tiny. 0 keeps everything. */
    cut: 0.08,
  },

  /**
   * Dot radius in CSS px, handed out by `tone` rather than at random. The rule
   * that matters is `max` against `step`: a dot is 2·max wide, so at 1 against
   * step 2 the brightest dots just touch their neighbours and a letter stroke
   * stays a stroke. Push `max` past half the step and the strokes fatten into
   * each other — that is what turns "keyboard" back into "grey slab". The 0.25
   * floor is a barely-there speck, which is what keeps the dim keys present
   * instead of blinking out.
   */
  dot: { min: 0.25, max: 2 },

  /** One entry per theme, same shape as the portrait's palette. */
  palette: {
    light: { color: "#000000", opacity: 0.8 },
    dark: { color: "#ffffff", opacity: 0.75 },
  },

  /**
   * The wander. `amount` is px travelled, `speed` is roughly radians per
   * second. This is the one that quietly undoes the detail: the strokes of a
   * key legend are about a pixel wide, so a dot allowed to travel 2 spends
   * most of its time off its own letter and the whole thing reads blurred even
   * though the still frame is sharp. Below 1 the field breathes and the
   * legends hold. Let `speed` carry the slowness instead.
   */
  drift: { amount: 0.8, speed: 1 },

  /**
   * Cursor push. The dots the pointer passes over slide out of its way and
   * drift back once it moves on. The field it applies is anchored to where
   * each dot belongs, not to where it currently is, so they settle instead of
   * chasing themselves in circles.
   *
   * Unlike `drift` this one is allowed to wreck the detail, because it undoes
   * itself the moment the cursor leaves. If the smear it drags across the
   * legends is too much anyway, `radius` narrows the damage and `strength`
   * softens it.
   */
  pointer: {
    /** How far the influence reaches, in px. */
    radius: 140,
    /** How far a dot right under the cursor is pushed. Negative pulls them in instead. */
    strength: 30,
    /** How fast they chase it. Higher = snappier, lower = more syrupy. */
    ease: 6,
    /** How much dots differ in how hard they react. 0 = all the same. */
    variance: 0.35,
  },

  /** Intro: the dots swim in from a scatter and settle onto the keyboard. */
  settle: {
    /**
     * The whole intro, in seconds — from the first dot moving to the last one
     * landing. This is the dial for "faster/slower entrance"; `stagger` only
     * decides how that time is divided up.
     */
    duration: 1.4,
    /**
     * Share of `duration` spent handing out head starts. 0 = every dot moves
     * at once and the keyboard snaps into place; 0.6 = a long trickle.
     */
    stagger: 0.5,
    /** How far from home the dots begin, in px. */
    spread: 140,
  },
};

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

type KeyboardOrientation = "horizontal" | "vertical";

/**
 * Reads the art at the size it will be painted, so dot spacing stays constant
 * no matter how large the canvas gets.
 */
function sample(
  image: HTMLImageElement,
  width: number,
  height: number,
  orientation: KeyboardOrientation,
): Dot[] {
  const buffer = document.createElement("canvas");
  buffer.width = width;
  buffer.height = height;

  const bctx = buffer.getContext("2d", { willReadFrequently: true });
  if (!bctx) return [];

  const vertical = orientation === "vertical";
  const artWidth = vertical ? image.height : image.width;
  const artHeight = vertical ? image.width : image.height;
  const fit = Math.min(width / artWidth, height / artHeight) * CONFIG.art.scale;
  const dw = image.width * fit;
  const dh = image.height * fit;

  if (vertical) {
    bctx.save();
    bctx.translate(
      width / 2 + CONFIG.art.offsetX * width,
      height / 2 + CONFIG.art.offsetY * height,
    );
    bctx.rotate(-Math.PI / 2);
    bctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
    bctx.restore();
  } else {
    bctx.drawImage(
      image,
      (width - dw) / 2 + CONFIG.art.offsetX * width,
      (height - dh) / 2 + CONFIG.art.offsetY * height,
      dw,
      dh,
    );
  }

  const { data } = bctx.getImageData(0, 0, width, height);
  const { step, average, alpha, jitter } = CONFIG.sampling;
  const { from, to, gamma, cut } = CONFIG.tone;
  const { min, max } = CONFIG.dot;
  const { amount, speed } = CONFIG.drift;
  const { spread } = CONFIG.settle;
  const { variance } = CONFIG.pointer;
  const dots: Dot[] = [];

  // Guarded so a `tone` with both ends on the same value degrades to a flat
  // field of the largest dot rather than dividing by zero.
  const span = to - from || 1;

  // Half a cell, rounded to whole pixels and never less than one, so that even
  // the finest grid still averages a 3×3 box rather than falling back to a
  // single pixel and defeating the point.
  const pad = average ? Math.max(1, Math.round(step / 2)) : 0;

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const cellX = Math.floor(x);
      const cellY = Math.floor(y);

      let sampleAlpha: number;
      let sampleLum: number;

      if (pad === 0) {
        const i = (cellY * width + cellX) * 4;
        sampleAlpha = data[i + 3];
        sampleLum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      } else {
        const top = cellY - pad < 0 ? 0 : cellY - pad;
        const bottom = cellY + pad > height - 1 ? height - 1 : cellY + pad;
        const left = cellX - pad < 0 ? 0 : cellX - pad;
        const right = cellX + pad > width - 1 ? width - 1 : cellX + pad;

        let sumAlpha = 0;
        let sumLum = 0;
        for (let iy = top; iy <= bottom; iy++) {
          const row = iy * width;
          for (let ix = left; ix <= right; ix++) {
            const i = (row + ix) * 4;
            sumAlpha += data[i + 3];
            sumLum +=
              0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          }
        }
        const taken = (bottom - top + 1) * (right - left + 1);
        sampleAlpha = sumAlpha / taken;
        sampleLum = sumLum / taken;
      }

      if (sampleAlpha < alpha) continue;

      const level = (sampleLum - from) / span;
      const clamped = level < 0 ? 0 : level > 1 ? 1 : level;
      const weight = gamma === 1 ? clamped : clamped ** gamma;
      if (weight < cut) continue;

      const hx = x + (Math.random() - 0.5) * step * jitter;
      const hy = y + (Math.random() - 0.5) * step * jitter;
      const angle = Math.random() * TAU;
      const distance = spread * (0.35 + Math.random() * 0.65);

      dots.push({
        hx,
        hy,
        sx: hx + Math.cos(angle) * distance,
        sy: hy + Math.sin(angle) * distance,
        r: min + weight * (max - min),
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

export function ParticleKeyboard({
  className = "",
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: KeyboardOrientation;
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
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
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
      if (w === width && h === height) return false;

      width = w;
      height = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        clock = CONFIG.settle.duration;
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
      dots = sample(image, width, height, orientation);
    };

    const start = () => {
      if (disposed || ready) return;
      ready = true;
      // The box takes the art's own ratio, so swapping the photo for a
      // different crop cannot letterbox it inside a shape it does not fill.
      if (
        orientation === "horizontal" &&
        image.naturalWidth > 0 &&
        image.naturalHeight > 0
      ) {
        canvas.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
      } else {
        canvas.style.aspectRatio = "auto";
      }
      measure();
      build();
      kick();
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
      { rootMargin: "200px" },
    );
    io.observe(wrap);

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) kick();
      else pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // On the window rather than the canvas: the whole band is
    // `pointer-events-none` so the links around it stay clickable, which means
    // it never receives a pointer event of its own.
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
    image.src = CONFIG.src;
    if (image.complete) start();

    return () => {
      disposed = true;
      pause();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerGone);
      image.removeEventListener("load", start);
      repaintRef.current = () => {};
    };
  }, [orientation]);

  // A theme flip only changes what the next frame is painted with — and with
  // motion off there is no next frame, so ask for one.
  useEffect(() => {
    paletteRef.current = CONFIG.palette[theme];
    stillRef.current = reducedMotion;
    repaintRef.current();
  }, [theme, reducedMotion]);

  const vertical = orientation === "vertical";
  const fade = `linear-gradient(to bottom, #000 ${CONFIG.layout.fadeFrom}, transparent 100%)`;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none relative w-full overflow-hidden ${className}`.trim()}
      style={{
        paddingBlock: vertical ? 0 : CONFIG.layout.padY,
        maskImage: vertical ? "none" : fade,
        WebkitMaskImage: vertical ? "none" : fade,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: vertical ? "100%" : CONFIG.layout.width,
          height: vertical ? "100%" : "auto",
          marginInline: "auto",
          // Placeholder until the art loads and replaces it with its own ratio.
          aspectRatio: vertical ? "auto" : CONFIG.layout.ratio,
          transform: vertical
            ? undefined
            : `translateX(${CONFIG.layout.shift})`,
        }}
      />
    </div>
  );
}
