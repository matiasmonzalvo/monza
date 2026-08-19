import { ParticleKeyboard } from "@/components/backgrounds/particle-keyboard";
import { Cell, CellGrid } from "@/components/layout/grid";
import { RevealText } from "@/components/scroll/reveal-text";
import { Handshake } from "reicon-react";

const COPY =
  "22yo design engineer based in Buenos Aires. I turn complex problems into clear, useful digital products, moving from early strategy to shipped details and building the systems that keep every experience coherent as it grows.\nThis is the tool I work with every day.";

const FACTS = [
  { value: "6 years", label: "Designing products" },
  { value: "40+", label: "Shipped features" },
  { value: "Based in", label: "Buenos Aires, Argentina" },
];

function Fact({ value, label }: (typeof FACTS)[number]) {
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

export function About() {
  return (
    <>
      <div className="px-6 pt-12 sm:px-8 md:pt-32 md:pb-0">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-subtle mb-4">
            <Handshake size={24} weight="Filled" strokeWidth={1.5} />
            <span className="text-lg text-muted-foreground text-medium tracking-tight">
              I'm Matias Monzalvo
            </span>
          </div>
          <RevealText
            text={COPY}
            className="text-balance text-2xl font-medium leading-[1.2] tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.15]"
          />
        </div>
      </div>

      <ParticleKeyboard className="border-b border-border" />

      <CellGrid className="grid-cols-1 sm:grid-cols-3">
        {FACTS.map((fact) => (
          <Cell key={fact.label} className="px-6 py-6 sm:px-6 sm:py-8">
            <Fact {...fact} />
          </Cell>
        ))}
      </CellGrid>
    </>
  );
}
