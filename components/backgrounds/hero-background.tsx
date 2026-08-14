"use client";

import LightTunnel from "@/components/backgrounds/light-tunnel";
import { useTheme } from "@/lib/theme";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Palettes tuned per theme: the shader composites straight onto the page. */
const PALETTE = {
  dark: {
    cableColor: "#262626",
    pulseColor: "#262626",
    tunnelColor: "#262626",
    brightness: 1,
    opacity: 0.9,
    grainIntensity: 0.05,
  },
  light: {
    cableColor: "#ffffff",
    pulseColor: "#262626",
    tunnelColor: "#262626",
    brightness: 0.7,
    opacity: 0.45,
    grainIntensity: 0.02,
  },
} as const;

export function HeroBackground() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const palette = PALETTE[theme];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <LightTunnel
        cableColor={palette.cableColor}
        pulseColor={palette.pulseColor}
        tunnelColor={palette.tunnelColor}
        brightness={palette.brightness}
        opacity={palette.opacity}
        grainIntensity={palette.grainIntensity}
        speed={reducedMotion ? 0 : 0.1}
        sway={reducedMotion ? 0 : 0.2}
        pulseSpeed={reducedMotion ? 0 : 0.4}
        flowDirection="outward"
        cableCount={12}
        thickness={0.7}
        rimWidth={0.1}
        waviness={0.1}
        size={1.6}
        glow={1}
        fadeNear={0.45}
        fadeFar={2}
        colorVariance
        grain
        mouseInteraction={!reducedMotion}
        mouseStrength={0.08}
      />

      {/* Keeps the headline legible without hiding the tunnel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,var(--background)_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
      />
    </div>
  );
}
