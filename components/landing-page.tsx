import { Frame, Section } from "@/components/layout/grid";
import { About } from "@/components/sections/about";
import { Contact, ContactPortrait } from "@/components/sections/contact";
import { Formation } from "@/components/sections/formation";
import { Hero, HeroPortrait } from "@/components/sections/hero";
import { PlugSeam } from "@/components/sections/plug-seam";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import type { Locale } from "@/lib/i18n";

export function LandingPage({ locale }: { locale: Locale }) {
  return (
    <main className="flex-1">
      {/* The opening copy stays outside the page grid. Its rails begin with
          the portrait and continue through About as one opening sequence. */}
      <Hero locale={locale} />
      <Frame capped>
        <HeroPortrait />
        <Section id="about">
          <About locale={locale} />
        </Section>
      </Frame>

      {/* Deliberately outside the frame: its rail has to run edge to edge. */}
      <Work locale={locale} />

      <Frame>
        <Section id="formation" bordered={false} className="border-b-0">
          <Formation locale={locale} />
        </Section>
      </Frame>

      <PlugSeam />

      <Frame cappedBottom>
        <Section id="skills" className="border-t-0">
          <Skills locale={locale} />
        </Section>
        <ContactPortrait />
      </Frame>

      <Contact locale={locale} />
    </main>
  );
}
