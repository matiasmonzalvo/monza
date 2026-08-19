import { ParticleKeyboard } from "@/components/backgrounds/particle-keyboard";
import { Cell, CellGrid } from "@/components/layout/grid";
import { RevealText } from "@/components/scroll/reveal-text";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { Handshake } from "reicon-react";

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <>
      <p className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-muted-foreground sm:text-lg">
        {label}
      </p>
    </>
  );
}

export function About({ locale = "en" }: { locale?: Locale }) {
  const copy = LANDING_COPY[locale].about;

  return (
    <>
      <div className="px-6 pt-12 sm:px-8 md:pt-32 md:pb-0">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-subtle mb-4">
            <Handshake
              size={20}
              weight="Filled"
              strokeWidth={1.5}
              className="sm:size-6"
            />
            <span className="text-base text-muted-foreground text-medium tracking-tight sm:text-lg">
              {copy.intro}
            </span>
          </div>
          <RevealText
            text={copy.description}
            className="text-balance text-2xl font-medium leading-[1.2] tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.15]"
          />
        </div>
      </div>

      <ParticleKeyboard className="border-b border-border" />

      <CellGrid className="grid-cols-1 sm:grid-cols-3">
        {copy.facts.map((fact) => (
          <Cell key={fact.label} className="px-6 py-6 sm:px-6 sm:py-8">
            <Fact {...fact} />
          </Cell>
        ))}
      </CellGrid>
    </>
  );
}
