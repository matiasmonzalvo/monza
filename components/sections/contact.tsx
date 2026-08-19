import { ChevronRight, Plane2 } from "reicon-react";
import { ParticlePortrait } from "@/components/backgrounds/particle-portrait";
import { GMAIL_MARK, LINKEDIN_MARK, X_MARK } from "@/components/icons/brand";
import { ParticleIcon } from "@/components/icons/particle-icon";
import { RevealText } from "@/components/scroll/reveal-text";
import { LANDING_COPY, type Locale } from "@/lib/i18n";

const EMAIL = "matias@monzalvo.com";

const CHANNELS = [
  { label: "Email", mark: GMAIL_MARK, value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "LinkedIn",
    mark: LINKEDIN_MARK,
    value: "/in/matias-monzalvo",
    href: "https://www.linkedin.com/in/matias-monzalvo/",
  },
  {
    label: "X",
    mark: X_MARK,
    value: "@matimonzalvo_",
    href: "https://x.com/matimonzalvo_",
  },
];

export function Contact({ locale = "en" }: { locale?: Locale }) {
  const copy = LANDING_COPY[locale].contact;
  const channels = CHANNELS.map((channel) =>
    channel.label === "Email" && locale === "es"
      ? { ...channel, label: "Correo electrónico" }
      : channel,
  );

  return (
    <section
      id="contact"
      className="px-6 pt-12 pb-16 sm:px-8 sm:pt-14 sm:pb-20"
    >
      {/*
        Two columns from `lg` up, stacked below it. The split waits for `lg`
        rather than `md`: the channel rows carry a 64px mark plus their value,
        which is more than half a tablet gives them.
      */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <div className="flex items-center gap-2 text-subtle mb-4">
            <Plane2 size={24} weight="Filled" strokeWidth={1.5} />
            <span className="text-lg text-muted-foreground text-medium tracking-tight">
              {copy.heading}
            </span>
          </div>
          {/*
            Finishing at 75% rather than the default 45% roughly halves what
            the fill costs in scroll, which is the point: this is the last
            paragraph on the page, so every px it asks for has to be invented
            underneath it. The `start` is left alone — the sentence should
            still light up on the way in, it just should not need the whole
            approach to finish.
          */}
          <RevealText
            text={copy.description}
            end="bottom 75%"
            className="text-balance text-2xl font-medium leading-[1.2] tracking-tight text-foreground sm:text-3xl md:text-4xl md:leading-[1.15]"
          />
        </div>

        {/*
          A column rather than the row of three this was, so the cards turn on
          their side: the mark leads and the value sits beside it.
        */}
        <div className="flex flex-col gap-2">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={
                channel.href.startsWith("http")
                  ? "noreferrer noopener"
                  : undefined
              }
              className="group flex items-center gap-5 rounded-2xl py-5 lg:px-5 lg:py-5 transition-colors hover:bg-surface"
            >
              <ParticleIcon mark={channel.mark} label={channel.label} />
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm text-foreground">
                {channel.value}
                <ChevronRight
                  size={14}
                  weight="Outline"
                  aria-hidden="true"
                  className="text-subtle transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/*
        The gap is doing work, not decoration. The reveal above finishes when
        the bottom of its paragraph reaches 75% down the viewport, and nothing
        follows this section — so without room below it the page runs out of
        scroll while the last words are still dim. That leaves 25% of a
        viewport to find, which is where the `vh` comes from: a fixed padding
        that looks right at 800px tall leaves the sentence unfinished at
        1400px. It tracks the reveal's `end`, so the two move together —
        shrink this alone and the tail of the sentence is what pays for it.
      */}
      <p className="mt-[25vh] text-center text-sm text-subtle">
        Matias Monzalvo 2026
      </p>
    </section>
  );
}

/** The final band inside the grid, mirroring the portrait that opens it. */
export function ContactPortrait() {
  return (
    <div className="relative flex h-[42vh] min-h-0 flex-col overflow-hidden lg:h-auto">
      <ParticlePortrait src="/contact-illustration.png" aspectRatio="1 / 1" />
    </div>
  );
}
