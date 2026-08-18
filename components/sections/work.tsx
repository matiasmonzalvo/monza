"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GUTTER } from "@/components/layout/grid";
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
 *  distance is spent dragging the track sideways, 1:1 — scroll 400px down,
 *  the rail moves 400px left. The page carries on normally once the track
 *  runs out.
 *
 *  Below `md`, and whenever reduced motion is asked for, none of that is
 *  created: the track is a native horizontal overflow container. Phones keep
 *  it free-scrolling, while the reduced-motion desktop fallback keeps its
 *  project snapping.
 *
 *  Sizing runs image-first. Every shot is given the same height (`--shot`) and
 *  the card takes whatever width that height and the image's own ratio come
 *  to, so the rail keeps one horizon and nothing is cropped to fit a box.
 * ────────────────────────────────────────────────────────────────
 */

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
  desktop: 0.58,
  mobile: 1.6,
};

/** Close enough to every shot in the rail — they run 1.76 to 2.03. */
const TYPICAL_RATIO = 1.76;

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
 *  THE HEADING — what a short screen is allowed to hide.
 *
 *  From `md` up the section is at least one viewport tall, but it may grow
 *  beyond it. The rail keeps its preferred shot height and ScrollTrigger pins
 *  the section with its bottom aligned to the viewport whenever the combined
 *  heading and rail are taller than the screen. The excess therefore leaves
 *  through the top of the viewport and comes out of the heading, never out of
 *  the project image or caption.
 *
 *  So each number here is a range — a floor, a share of the viewport height,
 *  and a ceiling. The ceiling is what a tall screen already showed, which is
 *  why nothing moves above roughly 1000px of height.
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
  const columnRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const column = columnRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !column || !viewport || !track) return;

    /** Publishes the lengths the rail lays itself out from. Pure reads. */
    const measure = () => {
      // Off `documentElement` rather than `100vw`: that counts the scrollbar,
      // and the column is centred in the space left over without it. Half a
      // scrollbar of drift against a 1px rule reads as a mistake, not a choice.
      const screen = document.documentElement.clientWidth;
      const screenHeight = document.documentElement.clientHeight;

      // `--rail`: the gap between the screen edge and the actual page column,
      // so the first card starts and the last one ends exactly on its rails.
      // Measuring the `max-w-6xl` element keeps the two in step without
      // duplicating Tailwind's container width here as a magic number — and it
      // picks up the gutter for free, so once the viewport is down to the
      // column this is simply the gutter and the track's own floor takes over.
      const columnWidth = column.getBoundingClientRect().width;
      section.style.setProperty(
        "--rail",
        `${Math.max(0, (screen - columnWidth) / 2)}px`,
      );

      // `--shot-sm`: the mobile height, worked back from how much of the
      // screen a card should cover.
      section.style.setProperty(
        "--shot-sm",
        `${Math.round((screen * SHOT.mobile) / TYPICAL_RATIO)}px`,
      );

      // `--shot-md`: the desktop's preferred height is `SHOT.desktop` of the
      // viewport. The only cap is the room the viewport has after the rail's
      // own padding and a caption are out, so the whole project always fits.
      //
      // The heading is deliberately absent. If the complete section is taller
      // than the screen, the pin start below lets the heading cross the top
      // edge until this rail fits instead of shrinking the cards to make room.
      const trackStyle = getComputedStyle(track);
      const caption = track.querySelector<HTMLElement>("[data-caption]");
      const available =
        screenHeight -
        parseFloat(trackStyle.paddingTop) -
        parseFloat(trackStyle.paddingBottom) -
        (caption?.offsetHeight ?? 0);
      const preferred = screenHeight * SHOT.desktop;

      section.style.setProperty(
        "--shot-md",
        `${Math.max(0, Math.round(Math.min(preferred, available)))}px`,
      );
    };

    measure();
    window.addEventListener("resize", measure);

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Native sideways scrolling is the fallback the markup ships with. Once
        // the pin drives the track, a second scrollable axis in here would just
        // desync the two. Reverted with the context when the query stops
        // matching, so shrinking the window hands it straight back.
        gsap.set(viewport, { overflow: "hidden" });
        viewport.scrollLeft = 0;

        // `w-max` on the track means its own box is the full length of the
        // rail, padding included — no `scrollWidth` guesswork, which drops the
        // trailing padding in most browsers. Measured against the viewport's
        // client width, so the page's scrollbar never enters the sum.
        const distance = () =>
          Math.max(0, track.offsetWidth - viewport.clientWidth);

        // A tall section first travels just far enough to put its bottom on the
        // viewport's bottom. That movement clips only the heading above; once
        // the horizontal sequence starts, the complete rail is visible and
        // the whole section is fixed. Tall screens that fit everything keep
        // the original top-to-top pin.
        const pinStart = () =>
          section.offsetHeight > document.documentElement.clientHeight
            ? "bottom bottom"
            : "top top";

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: pinStart,
            end: () => `+=${distance()}`,
            pin: true,
            // Plain `true`, not a number: ScrollSmoother already eases the
            // page, and a second lag on top reads as lost input.
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      },
    );

    return () => {
      window.removeEventListener("resize", measure);
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
        } as CSSProperties
      }
      // `-mt-px` drops the top rule onto the one the frame above already drew,
      // so the seam stays a hairline instead of doubling to 2px.
      //
      // `--shot` is the height every image shares, and the breakpoint picks
      // which of the two measured candidates it reads. The literals are only
      // the floor for a visitor with no JS — the knob is `SHOT`, above.
      className="relative -mt-px flex w-full flex-col border-b border-border [--shot:var(--shot-sm,50vw)] md:min-h-svh md:[--shot:var(--shot-md,58svh)]"
    >
      {/* Heading — the last thing here that obeys the page column, and so the
          only thing in this section that takes the gutter. The rail and the
          track below it are full-bleed by design and stay that way. */}
      <div className={GUTTER}>
        <div
          ref={columnRef}
          className="mx-auto w-full max-w-6xl border-x border-border"
        >
          {/* The literals are the heading as it has always looked, and all a
              phone ever sees: below `md` the section is not one viewport tall,
              so a long heading only pushes the rail down the page instead of
              stealing from it. The `md:` variants are where `HEADING` takes
              over. */}
          <div className="flex flex-col items-center justify-center gap-3 px-6 pb-20 pt-20 text-center sm:px-8 md:gap-[var(--head-gap)] md:pb-12 md:pt-[var(--head-pt)]">
            <h2 className="text-4xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
              Featured Work
            </h2>
            <p className="md:max-w-xl text-base text-pretty md:text-lg leading-relaxed text-muted-foreground">
              Sites, products and the systems behind them — {WORK.length}{" "}
              projects shipped end to end.
            </p>
          </div>
        </div>
      </div>

      {/* Full-bleed track. */}
      <div
        ref={viewportRef}
        // On tall screens the section's `min-h-svh` can leave a little free
        // space. `mt-auto` spends it above the rail, keeping the rail and the
        // section's bottom rule flush with the bottom of the pinned viewport.
        className="relative overflow-x-auto overflow-y-hidden border-t border-border [scrollbar-width:none] md:mt-auto md:flex-none md:snap-x md:snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {/* The rail's own padding, so `track.offsetWidth` already carries both
            ends and the travel maths below needs no adjusting. `max()` holds
            the floor once the screen is narrower than the column — and covers
            the first paint, before `--rail` has been measured. */}
        <div
          ref={trackRef}
          className="flex w-max items-start gap-6 px-[max(1.5rem,var(--rail,0px))] py-8 sm:gap-5"
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
              className="relative flex w-[calc(var(--shot)*var(--ratio))] shrink-0 flex-col md:snap-center"
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
              {/* Fixed height from `md` up: it is the one term `--shot` is
                  measured against, so it has to be the same for every card or
                  the images stop lining up. Four lines of caption fit. */}
              <div
                data-caption
                className="shrink-0 pt-5 md:h-28 md:overflow-hidden"
              >
                {/* Title and description are one paragraph, not two blocks:
                    both run `inline`, so the description carries on from the
                    title on the same line and only wraps when the line does.
                    They share one size, weight and leading — the title is told
                    apart by colour alone, and the full stop is what keeps the
                    two halves from reading as a single run-on phrase.

                    The space between them is spelled out: JSX drops whitespace
                    that spans a newline, so without it the two would butt up
                    against each other. */}
                <div className="text-pretty text-[15px] 2xl:text-lg font-medium leading-[1.25] tracking-tight px-4 max-w-sm md:max-w-none">
                  <h3 className="inline text-foreground">{item.title}.</h3>{" "}
                  <p className="inline text-muted-foreground ">
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
