"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * ────────────────────────────────────────────────────────────────
 *  DEVICE MIRROR — the page, inside a laptop, on the page.
 *
 *  A MacBook on a wide screen and an iPhone on a narrow one, both drawn in
 *  divs and borders, and the screen of each is a live miniature of THIS page
 *  scrolled to wherever the reader currently is. Scroll the real page and the
 *  little one keeps pace.
 *
 *  It is a real render, not a picture of one: an `<iframe>` at a full desktop
 *  or phone viewport, scaled down to fit the screen cutout. So the miniature
 *  is never out of date, and it shows the site's own responsive behaviour —
 *  the phone mirror is genuinely the phone layout, not the desktop one shrunk.
 *
 *  ────────────────────────────────────────────────────────────────
 *  THE THREE THINGS THAT MAKE THIS SAFE
 *
 *  1. RECURSION. The page in the frame contains this component, which would
 *     open another frame, and so on until the browser's nesting cap. The guard
 *     is `window.self !== window.top`: inside a frame the mirror renders its
 *     chrome and leaves the screen dark. So there is exactly one extra copy of
 *     the page alive, ever — never a chain of them.
 *
 *  2. COST. That one copy is still a whole second page: its own hydration, its
 *     own images, its own effects. Two things hold it down. The frame is only
 *     created once the device is actually on screen, and the per-frame sync
 *     stops the moment it leaves. And `smooth-scroll.tsx` carries the same
 *     `window.top` guard, so the copy runs without ScrollSmoother — which is
 *     both the single largest saving and the reason the sync below can just
 *     set `scrollTop` and be believed.
 *
 *  3. INTERACTION. The frame is inert: no pointer events, out of the tab
 *     order, hidden from assistive tech. It is a picture that happens to be
 *     live, and nothing in it is reachable.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * ────────────────────────────────────────────────────────────────
 *  THE DEVICES — every number that decides how they are drawn.
 *
 *  `viewport` is the size the page is rendered AT inside the frame, and it is
 *  the interesting one: the frame really is 1440 wide, then scaled down, which
 *  is why the miniature lays itself out like a desktop rather than like a
 *  320px-wide phone. Change it and you change which layout the mirror shows.
 *
 *  `screen` is the cutout it gets scaled into. The scale factor is just the
 *  ratio of the two, worked out below — no third number to keep in step.
 * ────────────────────────────────────────────────────────────────
 */
const MAC = {
  /** The lid's outer box, and the bezel inside it. */
  width: 378,
  bezel: 11,
  /** Radius of the lid, and of the screen cutout inside it. */
  radius: 16,
  /** What the page is rendered at before being scaled down. 16:10. */
  viewport: { width: 1440, height: 900 },
  /** The base under the lid: how far it juts out each side, and how deep. */
  baseOverhang: 26,
  baseHeight: 11,
  /** The lip cut into the front edge of the base. */
  lipWidth: 84,
  lipHeight: 4,
};

const PHONE = {
  width: 164,
  /** The band around the glass. */
  bezel: 9,
  radius: 24,
  /** iPhone-ish. The frame is scaled from this, so the mirror is the real
      mobile layout rather than the desktop one made small. */
  viewport: { width: 390, height: 844 },
  /** The Dynamic Island. */
  islandWidth: 68,
  islandHeight: 18,
  islandTop: 7,
};

/** Inner screen size for a device, from its outer width and its bezel. */
function screenOf(d: typeof MAC | typeof PHONE) {
  const width = d.width - d.bezel * 2;
  const height = (width * d.viewport.height) / d.viewport.width;
  return { width, height, scale: width / d.viewport.width };
}

const MAC_SCREEN = screenOf(MAC);
const PHONE_SCREEN = screenOf(PHONE);

/** What each device actually occupies, chrome included. */
const FOOTPRINT = {
  mac: {
    width: MAC.width + MAC.baseOverhang * 2,
    height: MAC_SCREEN.height + MAC.bezel * 2 + MAC.baseHeight + 2,
  },
  phone: {
    width: PHONE.width,
    height: PHONE_SCREEN.height + PHONE.bezel * 2 + 2,
  },
};

/** The tallest either device gets, so the cell reserves it before mount. */
const RESERVED = Math.round(
  Math.max(FOOTPRINT.mac.height, FOOTPRINT.phone.height),
);

export function DeviceMirror() {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  /**
   * `null` until the first effect has run, which is the only honest answer on
   * the server: the breakpoint is a client fact. The cell reserves `RESERVED`
   * either way, so filling it in costs no layout shift.
   */
  const [device, setDevice] = useState<"mac" | "phone" | null>(null);

  /**
   * Whether the frame exists at all. False inside a frame — that is the
   * recursion guard — and false until the device has first been scrolled near,
   * which is what keeps a page nobody reaches from loading a second copy of
   * itself in the background.
   *
   * Once true it never goes back. Tying the frame's existence to whether it is
   * on screen meant tearing it down on the way out and reloading the whole
   * page on the way back in, which is a full white flash every single time —
   * and it paid for the page again on every pass. Now it loads once.
   */
  const [armed, setArmed] = useState(false);

  /** Whether to keep it in step. Follows the viewport in both directions. */
  const [live, setLive] = useState(false);

  /**
   * Set when the frame reports it has loaded, and all the opacity below hangs
   * off it. A frame paints white before its document arrives, so it is held at
   * zero until then and the reader sees the screen's own background instead of
   * a flash of somebody else's page.
   */
  const [ready, setReady] = useState(false);

  /**
   * How much the device has to shrink to fit the cell it is in.
   *
   * Capped at 1 and never above it, which is the point. A frame scaled UP is
   * rasterised at its layout size and then stretched, so every line in the
   * miniature would go soft — the devices are drawn at the size the widest
   * cell can hold, and only ever come down from there.
   */
  const [fit, setFit] = useState(1);

  // Which device, and re-answered if the window crosses the breakpoint.
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const pick = () => setDevice(mq.matches ? "mac" : "phone");
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  /**
   * A frame that changed device is a frame that remounted: the two chassis are
   * different parents, so React tears the old one down and loads a new one.
   * Without this the new one would inherit a `ready` of true and be shown at
   * full opacity while it is still blank — the same flash, at the one moment
   * nobody would think to look for it.
   */
  useIsomorphicLayoutEffect(() => {
    setReady(false);
  }, [device]);

  // Fit to the cell.
  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !device) return;

    const measure = () => {
      const room = host.clientWidth;
      if (room <= 0) return;
      setFit(Math.min(1, room / FOOTPRINT[device].width));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [device]);

  // Whether the screen is worth lighting up.
  useIsomorphicLayoutEffect(() => {
    if (window.self !== window.top) return;

    const host = hostRef.current;
    if (!host) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setLive(entry.isIntersecting);
        if (entry.isIntersecting) setArmed(true);
      },
      // A screen's worth of margin, so the frame has time to paint before it
      // is looked at rather than assembling itself in front of the reader.
      { rootMargin: "100% 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  /**
   * The sync.
   *
   * Driven off GSAP's ticker rather than a `scroll` listener, and that is the
   * whole trick: with ScrollSmoother running, `window.scrollY` is where the
   * page is going, not where it is drawn. What the reader can actually see is
   * the smooth content's own translate, so that is what gets mirrored — and it
   * is read every frame because a smoother keeps moving after the wheel stops.
   *
   * Mapped by progress and not by pixels. The frame's viewport is not the
   * reader's, so its document is a different height; matching the two by their
   * share of the way down is what puts the miniature on the same part of the
   * page rather than at the same number of pixels.
   */
  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const frame = frameRef.current;
    if (!frame) return;

    const content = document.getElementById("smooth-content");
    let last = -1;

    const tick = () => {
      const inner = frame.contentWindow;
      // `contentDocument` is not enough. A frame hands one back before its
      // document has a root element, and again while it is swapping one out,
      // and in both of those windows `documentElement` is null — which is a
      // real state on any pass where the frame is still settling, not an
      // edge case. Read the root once and let everything below trust it.
      const root = frame.contentDocument?.documentElement;
      if (!inner || !root) return;

      // `#smooth-content` exists in every viewport, but it is only translated
      // while ScrollSmoother has a non-zero smoothing duration. On touch
      // devices `smoothTouch: 0` deliberately leaves it at y=0, so using the
      // node's mere existence as the switch pinned the phone mirror to the
      // hero. Reduced-motion visitors take the same native-scroll path.
      const smoother = ScrollSmoother.get();
      const shown =
        content && smoother && smoother.smooth() > 0
          ? -(gsap.getProperty(content, "y") as number)
          : window.scrollY;

      const hostRun =
        document.documentElement.scrollHeight - window.innerHeight;
      const innerRun = root.scrollHeight - inner.innerHeight;
      if (hostRun <= 0 || innerRun <= 0) return;

      const to = Math.round((shown / hostRun) * innerRun);
      // Scrolling a document costs a repaint of it. Half the frames of a slow
      // scroll ask for a position it is already at, and this drops those.
      if (to === last) return;
      last = to;
      inner.scrollTo(0, to);
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [armed, live]);

  const screen = device === "phone" ? PHONE_SCREEN : MAC_SCREEN;
  const spec = device === "phone" ? PHONE : MAC;

  const mirror = (
    <div
      style={{ width: screen.width, height: screen.height }}
      className="relative overflow-hidden bg-background"
    >
      {armed ? (
        <iframe
          ref={frameRef}
          src="/"
          title=""
          aria-hidden="true"
          tabIndex={-1}
          scrolling="no"
          onLoad={() => setReady(true)}
          style={{
            width: spec.viewport.width,
            height: spec.viewport.height,
            transform: `scale(${screen.scale})`,
            transformOrigin: "top left",
          }}
          // `border-0` because a frame ships with one, and at this scale a 2px
          // browser default is a visible line around the whole miniature.
          //
          // Held at zero until it says it has loaded. An unloaded frame paints
          // white — not the page's white, the browser's — so without this the
          // screen flashes before it fills. Fading in from the screen's own
          // background instead reads as the display coming on, which is a
          // better thing for a laptop to do than a page appearing.
          className={`pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-700 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );

  return (
    <div
      ref={hostRef}
      // Reserved before the device is known, then handed the height the scaled
      // one actually takes. Without the first the cell jumps when this mounts;
      // without the second it keeps the unscaled height and leaves a gap under
      // a device that shrank.
      style={{
        height: device ? Math.round(FOOTPRINT[device].height * fit) : RESERVED,
      }}
      className="flex w-full my-6 items-center justify-center overflow-hidden"
    >
      {device ? (
        <div
          style={{ transform: `scale(${fit})` }}
          className="origin-center will-change-transform"
        >
          {device === "mac" ? (
            <MacBook>{mirror}</MacBook>
          ) : (
            <IPhone>{mirror}</IPhone>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The laptop. Lid, then a base wider than it with a lip bitten out of the
 * front edge — which is the one detail that stops the base reading as a shelf.
 */
function MacBook({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div
        style={{ padding: MAC.bezel, borderRadius: MAC.radius }}
        className="border border-border-strong bg-surface-2 shadow-sm"
      >
        <div
          style={{ borderRadius: Math.max(0, MAC.radius - MAC.bezel) }}
          // The inner radius is the outer one minus the bezel, so the gap
          // between the two curves stays even all the way round instead of
          // pinching on the diagonal. Same rule the dropdown's panel uses.
          className="overflow-hidden border border-border"
        >
          {children}
        </div>
      </div>

      {/* Base. */}
      <div
        style={{
          width: MAC.width + MAC.baseOverhang * 2,
          height: MAC.baseHeight,
        }}
        className="relative rounded-b-[7px] border-x border-b border-border-strong bg-surface"
      >
        <div
          style={{ width: MAC.lipWidth, height: MAC.lipHeight }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-full border-x border-b border-border-strong bg-surface-2"
        />
      </div>
    </div>
  );
}

/** The phone. Band, glass, and the island sitting over both. */
function IPhone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ padding: PHONE.bezel, borderRadius: PHONE.radius }}
      className="relative border border-border-strong bg-background shadow-sm"
    >
      <div
        style={{ borderRadius: Math.max(0, PHONE.radius - PHONE.bezel) }}
        className="overflow-hidden border border-border"
      >
        {children}
      </div>
    </div>
  );
}
