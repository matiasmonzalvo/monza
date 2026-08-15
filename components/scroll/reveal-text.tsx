"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * ────────────────────────────────────────────────────────────────
 *  REVEAL TEXT — a paragraph that fills in as the page scrolls past it.
 *
 *  Every word is its own inline-block, dropped to `dim` and carried back to
 *  full as the scroll runs from `start` to `end`. They are staggered, so what
 *  the eye follows is a soft front travelling along the lines rather than the
 *  whole block fading up at once.
 *
 *  The dim value is only ever written from JS, and only inside the
 *  reduced-motion guard: a visitor with no JS — or one who asked for less
 *  motion — gets the paragraph as plain readable text, never a wall of words
 *  stuck at 12%.
 * ────────────────────────────────────────────────────────────────
 */
const CONFIG = {
  /**
   * How much of a word is left standing before the fill reaches it. 0 is a
   * word that arrives out of nothing; past ~0.3 the effect stops reading as a
   * fill at all because the text was already legible.
   */
  dim: 0.12,

  /**
   * How much of the run a single word spends filling, as a share of the whole.
   * This is the softness of the front: 0 snaps each word on one at a time,
   * 0.15 keeps roughly a line's worth of words mid-fill at any moment, and
   * much past 0.4 the front is so wide the paragraph just fades as a block.
   */
  softness: 0.15,

  /**
   * Where the fill starts and finishes, in ScrollTrigger's own terms —
   * "<edge of the block> <point in the viewport>". The pair below has the
   * first word lighting up as the paragraph clears the fold and the last one
   * landing while the block still sits above the middle of the screen, so the
   * sentence is never finishing off-screen.
   */
  start: "top 85%",
  end: "bottom 45%",
};

export function RevealText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const paragraph = ref.current;
    if (!paragraph) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = paragraph.querySelectorAll<HTMLElement>("[data-word]");
      if (words.length === 0) return;

      // Dimmed here, up front, and not left to the tween's own `from` to get
      // around to.
      //
      // The bug this fixes: on the very first scroll through the paragraph,
      // the words AHEAD of the front were not dim — they sat at full opacity,
      // so what travelled along the block was a single dim word crossing text
      // that was already lit, the effect exactly inverted. Every pass after
      // that was correct, which is the tell: by then the tween had rendered
      // each word at least once, and a word it has touched has a value to go
      // back to.
      //
      // Whatever the tween does or does not write on its first render, this
      // line makes the answer moot — every word is dim from the moment the
      // effect runs, and the tween's only job is raising them. Reverted with
      // the context like everything else in here, so the reduced-motion and
      // no-JS promise above is unchanged.
      gsap.set(words, { opacity: CONFIG.dim });

      // `amount` hands out the head starts across the whole set, `duration` is
      // what one word then takes — so the timeline runs 1 + softness long and
      // the scrub maps the scroll onto it whatever the word count is.
      //
      // Still a `fromTo` rather than a `to` even with the set above, and that
      // is not belt and braces: `invalidateOnRefresh` makes the tween
      // re-record its endpoints on every refresh, and a `to` would take
      // whatever a half-faded word happened to be at that instant as its
      // start. Spelling both ends out is what keeps a refresh mid-scroll from
      // quietly rewriting the range.
      gsap.fromTo(
        words,
        { opacity: CONFIG.dim },
        {
          opacity: 1,
          ease: "none",
          duration: CONFIG.softness,
          stagger: { amount: 1, ease: "none" },
          scrollTrigger: {
            trigger: paragraph,
            start: CONFIG.start,
            end: CONFIG.end,
            // Plain `true`: ScrollSmoother already eases the page, and a
            // second lag on top of it reads as lost input.
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    return () => {
      mm.revert();
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((word, index) => (
        // The space is a real text node between two inline-blocks, not part of
        // the word: that is what lets the line break where it wants to. Baked
        // into the span it would be a stretch of the word itself, and a
        // trailing space at a line end pushes the wrap one word early.
        <Fragment key={`${word}-${index}`}>
          <span data-word className="inline-block">
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </p>
  );
}
