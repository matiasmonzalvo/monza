import { ParticlePortrait } from "@/components/backgrounds/particle-portrait";
import { Section } from "@/components/layout/grid";
import { RotatingWord } from "@/components/sections/rotating-word";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { StarSparkle } from "reicon-react";

/**
 * ────────────────────────────────────────────────────────────────
 *  HERO — unframed headline followed by the framed particle portrait.
 *
 *  These pieces stay separate because the page grid begins at the portrait:
 *  the heading and actions live above the rails, while the portrait joins the
 *  framed sections below it.
 * ────────────────────────────────────────────────────────────────
 */
export function Hero({ locale = "en" }: { locale?: Locale }) {
  const copy = LANDING_COPY[locale].hero;

  return (
    <section id="top" className="relative">
      <div className="relative z-10 px-6 pt-24 pb-14 text-center sm:px-8 sm:py-32 lg:pt-32 lg:pb-20">
        <div className="flex items-center justify-center gap-2 text-subtle mb-4">
          <StarSparkle
            size={20}
            weight="Filled"
            strokeWidth={1.5}
            className="sm:size-6"
          />
          <span className="text-base text-muted-foreground text-medium tracking-tight sm:text-lg">
            {copy.welcome}
          </span>
        </div>
        <h1 className="text-center text-6xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-[5vw] 2xl:text-[4vw]">
          {copy.productPrefix ? `${copy.productPrefix} ` : null}
          <RotatingWord locale={locale} />
          {copy.productSuffix}
        </h1>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#contact"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-all hover:opacity-80 "
          >
            {copy.contact}
          </a>
          <a
            href="#work"
            className="inline-flex h-8 items-center rounded-lg bg-muted/50 px-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted"
          >
            {copy.work}
          </a>
        </div>
      </div>
    </section>
  );
}

/** The first band that belongs to the page grid. */
export function HeroPortrait() {
  return (
    <Section>
      <ParticlePortrait />
    </Section>
  );
}
