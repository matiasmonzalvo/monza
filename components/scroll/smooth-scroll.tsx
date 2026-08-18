"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * ────────────────────────────────────────────────────────────────
 *  Page-wide smooth scroll (GSAP ScrollSmoother).
 *
 *  The wrapper is pinned to the viewport and the content inside it is
 *  translated to catch up with the real scroll position, so the page eases
 *  instead of snapping to every wheel tick. The native scrollbar stays: the body
 *  is still as tall as the content.
 *
 *  Two consequences worth knowing before moving anything into here:
 *
 *  1. The content carries a transform, which makes it the containing block
 *     for `position: fixed` descendants. Anything fixed — the navbar — has
 *     to sit OUTSIDE this component, as a sibling in the layout.
 *  2. In-page anchors stop working on their own (see below).
 * ────────────────────────────────────────────────────────────────
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // The skills grid renders this page again inside an iframe, as the picture
    // on a laptop screen. That copy must not run a smoother: it is a second
    // full easing engine on a document nobody scrolls by hand, and it is the
    // largest thing the mirror would otherwise cost. It also has to not run
    // for the mirror to be correct — the miniature is driven by setting
    // `scrollTop`, and a smoother would ease its way there a beat behind the
    // real page instead of tracking it.
    if (window.self !== window.top) return;

    const mm = gsap.matchMedia();
    let smoother: ScrollSmoother | null = null;

    // Never created when the visitor asked for less motion — the two divs are
    // then inert and the page scrolls natively, which is the honest fallback.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      smoother = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 1.2,
        // Touch devices already have momentum scrolling; emulating it on top
        // fights the OS and feels heavier, not smoother.
        smoothTouch: 0,
        // Opts every `data-speed` / `data-lag` attribute on the page in.
        effects: true,
        // Mobile browsers resize the viewport when the URL bar hides. Left on,
        // that fires a refresh mid-scroll and every pin jumps.
        ignoreMobileResize: true,
      });

      // Images arriving late change the document height, and every pin after
      // them is measured against the old one.
      const onLoad = () => ScrollTrigger.refresh();

      window.addEventListener("load", onLoad);

      return () => {
        window.removeEventListener("load", onLoad);
        smoother?.kill();
        smoother = null;
      };
    });

    /**
     * Scroll section links ourselves so they never write a hash to the URL.
     * Capture phase, and `preventDefault` only — `next/link` checks
     * `defaultPrevented` before navigating, while the mobile drawer's own
     * click handler can still run and close it.
     */
    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      const clicked = event.target;
      const anchor = clicked instanceof Element ? clicked.closest("a") : null;
      if (!anchor || anchor.hasAttribute("download") || anchor.target) return;

      // Resolved against the page, so `#work` and `/#work` arrive the same.
      // A `mailto:` lands here too and falls out on the origin check.
      const url = new URL(anchor.href, window.location.href);
      // Same document, different spot. Anything else is a real navigation.
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      )
        return;

      const section = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (!section) return;

      event.preventDefault();

      const navbar = document.querySelector<HTMLElement>(
        "[data-landing-navbar]",
      );
      const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;

      if (smoother) {
        // `offset` measures through pins, so a pinned section still resolves
        // to its real start. Leaving room for the fixed navbar keeps that
        // start visible instead of tucking it beneath the bar.
        const destination =
          smoother.offset(section, "top top") - navbarHeight;
        smoother.scrollTo(Math.max(0, destination), true);
        return;
      }

      // Reduced-motion fallback: keep the same alignment without animation.
      const destination =
        window.scrollY + section.getBoundingClientRect().top - navbarHeight;
      window.scrollTo({ top: Math.max(0, destination), behavior: "auto" });
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      mm.revert();
    };
  }, []);

  // A route change swaps the whole document under the smoother; measurements
  // taken against the previous page are stale from here on.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div
        id="smooth-content"
        ref={contentRef}
        className="flex min-h-svh flex-col"
      >
        {children}
      </div>
    </div>
  );
}
