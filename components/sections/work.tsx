"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/layout/grid";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { WORK } from "@/lib/work";

/**
 * ────────────────────────────────────────────────────────────────
 *  WORK — the section that breaks the page column.
 *
 *  The heading keeps the 1200px rails so it reads as one more block of the
 *  grid; the rail underneath it runs the full width of the screen, which is
 *  why this section is rendered OUTSIDE `<Frame>` rather than fighting its
 *  max-width from inside.
 *
 *  Scrolling: the section pins at the top of the viewport and the vertical
 *  distance is spent dragging the track sideways — scroll down, the rail moves
 *  left. On a wide screen that trade is 1:1; on a phone it is `MOBILE.pace`,
 *  for the reason written there. The page carries on normally once the track
 *  runs out.
 *
 *  Whenever reduced motion is asked for, none of that is created: the track is
 *  a plain snap-scrolling overflow container, which is also what a visitor
 *  with no JS gets.
 *
 *  Sizing runs image-first. Every shot is given the same height (`--shot`) and
 *  the card takes whatever width that height and the image's own ratio come
 *  to, so the rail keeps one horizon and nothing is cropped to fit a box.
 * ────────────────────────────────────────────────────────────────
 */

/** The page column, straight off `<Frame>`. Has to stay in step with it. */
const COLUMN = 1200;

/**
 * ────────────────────────────────────────────────────────────────
 *  HOW BIG THE CARDS ARE — the only thing here worth turning.
 *
 *  Every shot gets the same height and each card is then as wide as that
 *  height and its own image's ratio make it, so these two numbers size the
 *  whole rail.
 * ────────────────────────────────────────────────────────────────
 */
const SHOT = {
  desktop: 1,
  mobile: 2,
};

/** Close enough to every shot in the rail — they run 1.76 to 2.03. */
const TYPICAL_RATIO = 1.76;

/**
 * ────────────────────────────────────────────────────────────────
 *  MOBILE — the numbers the phone needs and the desktop does not.
 *
 *  Nothing about the sideways scroll is a touch-device limit. It is the same
 *  ScrollTrigger either way; it simply used to be created only from `md` up,
 *  so a phone fell through to the native swipe the markup ships with. What a
 *  phone does need is its own answer to two questions the desktop never asks.
 *
 *  `pace` — how much rail one pixel of page scroll buys. A wide screen runs
 *  1:1 and a rail this long is a few flicks of a wheel; the same rail on a
 *  phone is over ten screens of it, and 1:1 turns the section into a thumb
 *  marathon nobody finishes. Above 1 the rail runs ahead of the finger: 1.6
 *  means the whole rail costs 1/1.6 of the scrolling. Too high and the cards
 *  smear past faster than they can be read — 1.4 to 2 is the usable band.
 *
 *  `caption` — the room the text under each shot is held to. It has to be a
 *  fixed number rather than whatever the text comes to, because `measure()`
 *  subtracts it to find the room left for the shots: let it size itself and
 *  the width of a card would decide the height of a card. Same reason the
 *  desktop's caption is a fixed `h-28`.
 *
 *  `lines` is the same number said in the other unit, and the two have to
 *  agree — `height` is what the layout reserves, `lines` is where the text is
 *  actually cut, and the ellipsis only lands where it should while the second
 *  fits inside the first. At `text-lg` on a card this narrow, five lines is
 *  about 150 characters, which is every description in `WORK` but one.
 *
 *  To hand the phone its native swipe back, put `(min-width: 768px) and` in
 *  front of the `isCalm` query below; everything here goes inert with it.
 * ────────────────────────────────────────────────────────────────
 */
const MOBILE = {
  /** Rail pixels moved per pixel of page scroll. The desktop is a fixed 1. */
  pace: 1.6,
  /** The caption below `md`: px reserved, and the lines that fill them. */
  caption: { height: 132, lines: 5 },
};

/**
 * ────────────────────────────────────────────────────────────────
 *  THE TILT — the angle every shot sits at.
 *
 *  `perspective()` has to lead the list and stay there. Without it the
 *  rotations are drawn flat: `rotateY(28deg)` alone just squashes the image to
 *  88% of its width, which reads as a broken aspect ratio rather than as a
 *  card turned away from you. The value is the distance to the eye — drop it
 *  for a heavier, wide-angle depth, raise it to flatten the effect out.
 *
 *  Layout does not see any of this. `track.offsetWidth` still measures the
 *  upright box, so the scroll distance stays exact; what changes is only what
 *  gets painted, which is also why a tilted card can spill past the band and
 *  clip. `SHOT.desktop` is where the room for it comes from.
 * ────────────────────────────────────────────────────────────────
 */
const TILT = "perspective(1200px) rotateX(-40deg) rotateY(0deg) rotateZ(0deg)";

/**
 * ────────────────────────────────────────────────────────────────
 *  THE HEADING — how much of a short screen it may take.
 *
 *  The section is exactly one viewport tall at every width — it has to be, or
 *  the pin would hold a section taller than the screen and the bottom of it
 *  would never be reachable — so every pixel the heading spends comes straight
 *  off the shots. Fixed padding and a fixed title were fine on a tall screen
 *  and wrong on a short one: at 1440×620 the old `pt-24` plus a 72px title ate
 *  ~240px of a 620px band, and the rail was left with less than what the
 *  caption underneath it takes. A phone held sideways is the same screen.
 *
 *  So each number here is a range — a floor, a share of the viewport height,
 *  and a ceiling. The ceiling is what a tall screen already showed, which is
 *  why nothing moves above roughly 1000px of height; below that the heading
 *  gives its room back to the shots instead of squeezing them.
 *
 *  Only the title has two ceilings: it steps up at `lg`, as it always did.
 * ────────────────────────────────────────────────────────────────
 */
const HEADING = {
  /** Space above the title. Ceiling is `pt-24`. */
  padTop: { min: 32, svh: 9, max: 96 },
  /** Space under the copy, down to the rail's top rule. Ceiling is `pb-8`. */
  padBottom: { min: 16, svh: 3.5, max: 32 },
  /** Gap between title and line. Ceiling is `gap-3`. */
  gap: { min: 4, svh: 1.2, max: 12 },
  /** Title. Ceilings are `text-6xl` and, from `lg`, `text-7xl`. */
  title: { min: 36, svh: 8, md: 60, lg: 72 },
  /** The line under it. Ceiling is `text-base`; the floor is `text-sm`. */
  body: { min: 14, svh: 2.2, max: 16 },
};

/** A `HEADING` range as the one CSS value it stands for. */
const fluid = (min: number, svh: number, max: number) =>
  `clamp(${min}px, ${svh}svh, ${max}px)`;

export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    /** Publishes the lengths the rail lays itself out from. Pure reads. */
    const measure = () => {
      // Off `documentElement` rather than `100vw`: that counts the scrollbar,
      // and the column is centred in the space left over without it. Half a
      // scrollbar of drift against a 1px rule reads as a mistake, not a choice.
      const screen = document.documentElement.clientWidth;

      // `--rail`: the gap between the screen edge and the page column, so the
      // first card starts and the last one ends on the same line the rest of
      // the page is built on.
      section.style.setProperty("--rail", `${(screen - COLUMN) / 2}px`);

      // `room`: what the band has left for a shot once its own padding and a
      // caption are out. Both candidate heights below are cut from it.
      //
      // Read off the DOM instead of spelled out as `calc(100svh - 400px)`,
      // because the heading above is responsive and rewordable and a number
      // baked in here would quietly stop matching the first time it changes.
      //
      // No loop hides in this: the band is `flex-1` of a `svh` section so its
      // height owes nothing to the cards, and the caption's is fixed by its
      // own class at every width — which is why that class has to stay a fixed
      // height, `MOBILE.caption` included.
      const trackStyle = getComputedStyle(track);
      const caption = track.querySelector<HTMLElement>("[data-caption]");
      const room = Math.max(
        0,
        Math.round(
          viewport.clientHeight -
            parseFloat(trackStyle.paddingTop) -
            parseFloat(trackStyle.paddingBottom) -
            (caption?.offsetHeight ?? 0),
        ),
      );

      // `--shot-sm`: the mobile height. Worked back from how much of the
      // screen's WIDTH a card should cover, because a phone's constraint is
      // sideways — a shot cut to fill the band would come out wider than the
      // screen and no single project would ever be visible whole.
      //
      // `min` with the band is the safety net for the case where that stops
      // being true: a phone held sideways, where the heading and the padding
      // between them leave less height than 88% of the width asks for. There
      // the shot shrinks rather than spilling out of a pinned section that
      // cannot be scrolled down to.
      section.style.setProperty(
        "--shot-sm",
        `${Math.min(Math.round((screen * SHOT.mobile) / TYPICAL_RATIO), room)}px`,
      );

      // `--shot-md`: the desktop height — `SHOT.desktop` of that same room.
      section.style.setProperty(
        "--shot-md",
        `${Math.round(room * SHOT.desktop)}px`,
      );
    };

    // A phone hiding or showing its URL bar fires a resize with the width
    // unchanged. Re-measuring on one of those re-sizes the rail mid-scroll
    // while the pin still holds the length it was built with, and the track
    // jumps — the same thing ScrollSmoother's `ignoreMobileResize` is there to
    // stop, which is also why that flag cannot cover this. The heading is in
    // `svh`, which a hidden URL bar does not move either, so there is nothing
    // to recompute. A desktop window dragged shorter is a real height change
    // and still goes through.
    let lastWidth = document.documentElement.clientWidth;
    const onResize = () => {
      const width = document.documentElement.clientWidth;
      const heightOnly = width === lastWidth;
      lastWidth = width;
      if (heightOnly && !window.matchMedia("(min-width: 768px)").matches)
        return;
      measure();
    };

    measure();
    window.addEventListener("resize", onResize);

    const mm = gsap.matchMedia();

    // Split in two so the callback can tell a phone from a desktop and still
    // be re-run when the screen crosses between them — one combined query
    // string would keep matching across the breakpoint and `pace` would stay
    // on whatever it was built with.
    mm.add(
      {
        isWide: "(min-width: 768px)",
        isCalm: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isWide, isCalm } = (context.conditions ?? {}) as {
          isWide: boolean;
          isCalm: boolean;
        };
        if (!isCalm) return;

        // Native sideways scrolling is the fallback the markup ships with. Once
        // the pin drives the track, a second scrollable axis in here would just
        // desync the two — and on touch it would be the finger fighting the
        // pin directly. Reverted with the context when the query stops
        // matching, so asking for reduced motion hands it straight back.
        gsap.set(viewport, { overflow: "hidden" });
        viewport.scrollLeft = 0;

        // `w-max` on the track means its own box is the full length of the
        // rail, padding included — no `scrollWidth` guesswork, which drops the
        // trailing padding in most browsers. Measured against the viewport's
        // client width, so the page's scrollbar never enters the sum.
        const distance = () =>
          Math.max(0, track.offsetWidth - viewport.clientWidth);

        // The rail always travels its whole length; `pace` only decides how
        // much scrolling that costs. Which is why it divides the trigger's end
        // and not the tween — the two would come apart otherwise.
        const pace = isWide ? 1 : MOBILE.pace;

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() / pace}`,
            pin: true,
            // Plain `true`, not a number: ScrollSmoother already eases the
            // page, and a second lag on top reads as lost input. On touch it
            // is not easing anything at all (`smoothTouch: 0`), so a scrub
            // delay there would just be the rail trailing the finger.
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      },
    );

    // Every refresh re-reads the section, so the lengths it reads have to be
    // the current ones. Without this the pin is rebuilt against whatever
    // `--shot` was set to before the window changed.
    ScrollTrigger.addEventListener("refreshInit", measure);

    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", measure);
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      // The heading's ranges, resolved once. They are CSS all the way down —
      // no measuring, so they are already right on the first paint and follow a
      // window being dragged shorter without waiting on `measure()`.
      style={
        {
          "--head-pt": fluid(
            HEADING.padTop.min,
            HEADING.padTop.svh,
            HEADING.padTop.max,
          ),
          "--head-pb": fluid(
            HEADING.padBottom.min,
            HEADING.padBottom.svh,
            HEADING.padBottom.max,
          ),
          "--head-gap": fluid(
            HEADING.gap.min,
            HEADING.gap.svh,
            HEADING.gap.max,
          ),
          "--head-title": fluid(
            HEADING.title.min,
            HEADING.title.svh,
            HEADING.title.md,
          ),
          "--head-title-lg": fluid(
            HEADING.title.min,
            HEADING.title.svh,
            HEADING.title.lg,
          ),
          "--head-body": fluid(
            HEADING.body.min,
            HEADING.body.svh,
            HEADING.body.max,
          ),
          "--caption": `${MOBILE.caption.height}px`,
          "--caption-lines": String(MOBILE.caption.lines),
        } as CSSProperties
      }
      // `-mt-px` drops the top rule onto the one the frame above already drew,
      // so the seam stays a hairline instead of doubling to 2px.
      //
      // `--shot` is the height every image shares, and the breakpoint picks
      // which of the two measured candidates it reads. The literals are only
      // the floor for a visitor with no JS — the knob is `SHOT`, above.
      className="relative -mt-px flex h-svh w-full flex-col border-b border-border [--shot:var(--shot-sm,50vw)] md:[--shot:var(--shot-md,58svh)]"
    >
      {/* Heading — the last thing here that obeys the page column. */}
      <div className="mx-auto w-full max-w-[1200px] border-x border-border">
        {/* `HEADING` all the way down, at every width. The literals that used
            to sit here below `md` were safe while a phone let the section run
            as tall as it liked; now that it is pinned to one viewport, a fixed
            `pt-24` and a fixed 60px title are 250px a landscape phone does not
            have to give. */}
        <div className="flex flex-col items-center justify-center gap-[var(--head-gap)] px-6 pb-[var(--head-pb)] pt-[var(--head-pt)] text-center sm:px-8">
          {/* `length:` is spelled out because a bare variable behind `text-`
              is ambiguous — Tailwind would read it as a colour.

              Written out in prose rather than shown: Tailwind scans this file
              as plain text, comments and all, so a class-shaped example in
              here becomes a real rule in the stylesheet. */}
          <h2 className="text-[length:var(--head-title)] font-medium leading-[1.05] tracking-tighter text-foreground lg:text-[length:var(--head-title-lg)]">
            Work
          </h2>
          <p className="max-w-xl text-pretty text-[length:var(--head-body)] leading-relaxed text-muted-foreground">
            Sites, products and the systems behind them — {WORK.length} projects
            shipped end to end.
          </p>
        </div>
      </div>

      {/* Full-bleed track. */}
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-t border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* The rail's own padding, so `track.offsetWidth` already carries both
            ends and the travel maths below needs no adjusting. `max()` holds
            the floor once the screen is narrower than the column — and covers
            the first paint, before `--rail` has been measured. */}
        <div
          ref={trackRef}
          // `items-center` below `md` because that is the one width where a
          // card can end up shorter than the band it sits in: the shot is cut
          // to the screen's width there, not to the room available, so any
          // height left over is split above and below rather than pooling
          // under the rail.
          className="flex h-full w-max items-center gap-6 px-[max(1.5rem,var(--rail,0px))] py-8 sm:gap-5 md:items-start"
        >
          {WORK.map((item) => (
            <article
              key={item.slug}
              // The card is sized off its shot, not the other way round: a
              // shared height, and whatever width that height and the image's
              // own ratio come to. Nothing is ever cropped to fit a box.
              // Stringified so nothing downstream is tempted to read a bare
              // number as pixels.
              style={
                {
                  "--ratio": String(item.image.width / item.image.height),
                } as CSSProperties
              }
              className="flex w-[calc(var(--shot)*var(--ratio))] shrink-0 snap-center flex-col relative"
            >
              <div className="relative">
                {/* <div className="absolute w-full h-[50%] bg-linear-to-b from-transparent via-background/10 to-background z-50 bottom-0 left-0"></div> */}
                <div
                  // style={{ transform: TILT }}
                  className="relative h-[var(--shot)] w-full overflow-hidden rounded-3xl bg-surface"
                >
                  {/* The frame is already the image's own ratio, so `cover` has
                    nothing to crop — it is here to swallow the half-pixel the
                    rounding can leave rather than letterbox it. */}
                  <Image
                    src={item.image}
                    alt={`Screenshot of ${item.title}`}
                    fill
                    sizes="(min-width: 768px) 60vw, 90vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Fixed height at every width: it is the one term `--shot` is
                  measured against, so it has to be the same for every card or
                  the images stop lining up — and if it sized itself, the width
                  of a card would end up deciding the height of a card. Four
                  lines of caption fit from `md`; `MOBILE.caption` is the same
                  bargain on a phone, where the cards are narrower and the same
                  description wraps into more of them. */}
              <div
                data-caption
                className="h-[var(--caption)] shrink-0 overflow-hidden pt-5 md:h-28"
              >
                {/* Title and description are one paragraph, not two blocks:
                    both run `inline`, so the description carries on from the
                    title on the same line and only wraps when the line does.
                    They share one size, weight and leading — the title is told
                    apart by colour alone, and the full stop is what keeps the
                    two halves from reading as a single run-on phrase.

                    The space between them is spelled out: JSX drops whitespace
                    that spans a newline, so without it the two would butt up
                    against each other.

                    The clamp is a phone-only concern: the same description
                    wraps into roughly a third more lines on a card this narrow
                    than it does at `max-w-md`, so the one long entry in `WORK`
                    would run past the reserved height and get sliced mid-word.
                    Off again from `md`, where it always fitted and where the
                    fixed height alone has been enough. */}
                <div className="line-clamp-[var(--caption-lines)] max-w-md text-pretty text-lg font-medium leading-[1.25] tracking-tight px-4 md:line-clamp-none">
                  <h3 className="inline text-foreground">{item.title}.</h3>{" "}
                  <p className="inline text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
