"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server.
 *
 * Client components still render on the server, and React warns about layout
 * effects there. GSAP setup has to run before paint — one frame of untransformed
 * content reads as a jump — so the swap happens here rather than downgrading
 * every call site to `useEffect`.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
