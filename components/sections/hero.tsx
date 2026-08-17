import { ParticlePortrait } from "@/components/backgrounds/particle-portrait";
import { Section } from "@/components/layout/grid";
import { RotatingWord } from "@/components/sections/rotating-word";

/**
 * ────────────────────────────────────────────────────────────────
 *  HERO — one screen, closed off by a concave edge.
 *
 *  The band takes the whole viewport and hands the page directly to About.
 *
 *  Below `lg` the full height and the curve are dropped — at phone widths
 *  there is no gutter for a curve to live in — and this goes back to stacking
 *  at its natural height. The portrait stays: with no leftover space to take,
 *  it just claims a band of its own under the headline.
 * ────────────────────────────────────────────────────────────────
 */
export function Hero() {
  return (
    <Section id="top" className="lg:flex lg:min-h-screen lg:flex-col">
        {/* `lg:pb-12` rather than the 0 it used to be: on a tall screen this
            block ends where the rule below it starts, so it needs air of its
            own to sit on. It costs the portrait 48px of leftover. */}
        <div className="relative z-10 px-6 pt-24 pb-14 text-center sm:px-8 sm:py-32 lg:pt-32 lg:pb-20 bg-surface">
          <p className="mb-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            I'm Monza
          </p>
          <h1 className="text-6xl text-center font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-[4vw]">
            Product <RotatingWord />
          </h1>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#components"
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-white transition-all hover:opacity-80 hover:text-foreground"
            >
              View components
            </a>
            <a
              href="#contact"
              className="inline-flex h-10 items-center rounded-full bg-muted/50 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted"
            >
              Work with me
            </a>
          </div>
        </div>

        {/* Last in the column on purpose: it is the one thing here that is
            laid out rather than overlaid, so it takes exactly the height the
            headline leaves behind.

            It draws its own top rule, the way a `Cell` does. The rule is as
            wide as the section — but on `lg` the rails' gutter covers sit at
            `z-[6]`, above this at `z-[5]`, so what stays visible is the run
            across the 1200px column and the line lands on the two rails. */}
        <ParticlePortrait className="border-t border-border" />
    </Section>
  );
}
