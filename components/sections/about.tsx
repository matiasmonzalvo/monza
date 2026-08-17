import { ParticleKeyboard } from "@/components/backgrounds/particle-keyboard";
import { Cell, CellGrid } from "@/components/layout/grid";
import { RevealText } from "@/components/scroll/reveal-text";

const COPY =
  "I'm a 22yo product designer based in Buenos Aires. I turn complex problems into clear, useful digital products, moving from early strategy to shipped details and building the systems that keep every experience coherent as it grows.";

const FACTS = [
  { value: "6 years", label: "Designing products" },
  { value: "40+", label: "Shipped features" },
  { value: "Based in", label: "Buenos Aires, Argentina" },
];

function Fact({ value, label }: (typeof FACTS)[number]) {
  return (
    <>
      <p className="text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-muted-foreground sm:text-lg">
        {label}
      </p>
    </>
  );
}

export function About() {
  return (
    <>
      <div className="px-6 sm:px-8 md:pt-36">
        <div className="mx-auto max-w-4xl">
          <RevealText
            text={COPY}
            className="text-balance text-3xl font-medium leading-[1.2] tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.15]"
          />
        </div>
      </div>

      {/* The facts own this row's natural height on phones. The keyboard only
          stretches to match them, so the section needs no viewport-based
          height. */}
      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] border-t border-border md:hidden">
        <ParticleKeyboard
          orientation="vertical"
          className="h-full min-h-0 border-r border-border"
        />

        <div className="divide-y divide-border">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="bg-linear-to-br from-background to-muted/30 px-5 py-6"
            >
              <Fact {...fact} />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <ParticleKeyboard className="border-b border-border" />

        <CellGrid className="grid-cols-3">
          {FACTS.map((fact) => (
            <Cell
              key={fact.label}
              className="bg-linear-to-br from-background to-muted/30 px-6 py-8"
            >
              <Fact {...fact} />
            </Cell>
          ))}
        </CellGrid>
      </div>
    </>
  );
}
