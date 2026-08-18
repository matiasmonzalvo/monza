import { Frame, Section } from "@/components/layout/grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { About } from "@/components/sections/about";
import { ComponentLibrary } from "@/components/sections/component-library";
import { Contact, ContactPortrait } from "@/components/sections/contact";
import { Formation } from "@/components/sections/formation";
import { Hero, HeroPortrait } from "@/components/sections/hero";
import { PlugSeam } from "@/components/sections/plug-seam";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        {/* The opening copy stays outside the page grid. Its rails begin with
            the portrait and continue through About as one opening sequence. */}
        <Hero />
        <Frame capped>
          <HeroPortrait />
          <Section id="about">
            <About />
          </Section>
        </Frame>
        {/* Deliberately outside the frame: its rail has to run edge to edge,
            which it cannot do from inside a 1200px column. The heading in
            there re-draws the rails so the grid still reads as continuous. */}
        <Work />

        {/* `bordered={false}`, and the same on the skills side below: this
            block does not end in a rule, it ends in the connector under it.
            The line you see there is that connector's own top edge, and it
            leaves with it when the two halves pull apart. */}
        <Frame>
          <Section id="formation" bordered={false} className="border-b-0">
            <Formation />
          </Section>
        </Frame>

        {/* Outside the frame, and the one break in the column on the page. The
            two blocks stay exactly where they are; what closes the gap is the
            end of each one reaching into it, carrying these rails along. The
            burst also throws its dust past where they run, which needs the
            canvas under it to be full-bleed. */}
        <PlugSeam />

        <Frame cappedBottom>
          <Section id="skills" className="border-t-0">
            <Skills />
          </Section>

          {/* <Section id="components">
            <ComponentLibrary />
          </Section> */}

          <ContactPortrait />
        </Frame>

        {/* Mirroring the opening hero, the closing copy lives beyond the rails. */}
        <Contact />
      </main>
    </>
  );
}
