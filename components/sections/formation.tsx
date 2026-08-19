import { RevealText } from "@/components/scroll/reveal-text";
import { LANDING_COPY, type Locale } from "@/lib/i18n";

/**
 * ────────────────────────────────────────────────────────────────
 *  FORMATION — the line between the work and where it came from.
 *
 *  It sits directly under the work rail and directly over the seam, and it is
 *  the one block on the page that is read rather than looked at, so it gets
 *  the whole column to itself and nothing else in the band. The words fill in
 *  on scroll; `RevealText` owns that, and this file owns only the copy and how
 *  big it is set.
 * ────────────────────────────────────────────────────────────────
 */
export function Formation({ locale = "en" }: { locale?: Locale }) {
  return (
    <div className="px-6 py-24 sm:px-8 md:py-36">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:gap-10">
        {/* Tight tracking and short measure on purpose: the fill front reads
            as one gesture crossing the block only while the lines are close
            enough together to be taken in at once. */}
        <RevealText
          text={LANDING_COPY[locale].formation}
          className="text-balance text-2xl font-medium leading-[1.28] tracking-tight text-foreground sm:text-3xl md:text-4xl md:leading-[1.25]"
        />
      </div>
    </div>
  );
}
