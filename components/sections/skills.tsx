import {
  Sparkles,
  GraduationCap,
  PenTool,
  StackPerspective,
} from "reicon-react";
import { Cell, CellGrid, Eyebrow, Plus } from "@/components/layout/grid";
import { SkillVisual } from "@/components/sections/skill-visuals";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { getSkills } from "@/lib/skills";

/**
 * ────────────────────────────────────────────────────────────────
 *  SKILLS & EXPERIENCE — the block the seam plugs into.
 *
 *  A title band and then four cells, two by two. The band comes first and is
 *  what the seam lands on: centred, full column, the same shape as every other
 *  section opening on the page.
 *
 *  The cells are `CellGrid`, so each one draws only its own top and left rule
 *  and the container pulls the outer pair back under the frame. Nothing
 *  doubles up and nothing reaches past an edge it does not own. One `Plus`
 *  marks the middle, where all four meet — the only true four-way crossing in
 *  the block, and the one place that mark means anything.
 *
 *  Nothing draws a rule along its top edge, here or in `page.tsx`. The line
 *  there is the underside of the seam's lower connector, which is this block's
 *  own start: it reaches up out of here to meet the one coming down.
 *
 *  No pin, no scroll trigger, nothing this file has to hydrate for — it is a
 *  server component and it stays one. What moves inside two of the drawings is
 *  CSS, and it moves whether or not the JS ever arrives.
 * ────────────────────────────────────────────────────────────────
 */

/**
 * The eyebrow mark for each cell, by slug. Kept here rather than in
 * `lib/skills.ts` for the same reason the drawings are kept out of it: that
 * module is plain data and stays importable from anywhere.
 */
const MARKS = {
  "ai-first": Sparkles,
  education: GraduationCap,
  "ux-ui": PenTool,
  stack: StackPerspective,
};

export function Skills({ locale = "en" }: { locale?: Locale }) {
  const copy = LANDING_COPY[locale].skills;
  const skills = getSkills(locale);

  return (
    <>
      {/* The title band, unchanged. This is the face the seam plugs into, so
          it keeps the full column and the centred setting every other section
          opening on the page uses. */}
      <div className="flex flex-col items-center gap-4 px-6 pb-20 pt-12 text-center sm:px-8 md:pt-12 md:pb-32">
        <h2 className="text-4xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
          {copy.heading}
        </h2>
        <p className="md:max-w-xl text-base text-pretty md:text-lg leading-relaxed text-muted-foreground">
          {copy.description}
        </p>
      </div>

      <CellGrid className="grid-cols-1 md:grid-cols-2">
        {skills.map((skill, index) => {
          const Mark = MARKS[skill.slug as keyof typeof MARKS];
          return (
            <Cell key={skill.slug} className="flex flex-col">
              {/* Only the last cell. In a two-by-two that corner is where all
                  four meet, and it is the one crossing on the block worth
                  marking — the rest are edges, and an edge is not a
                  junction. */}
              {index === 3 ? (
                <Plus className="-left-[6px] -top-[6px] hidden md:block" />
              ) : null}

              {/* The padding lives here and nowhere else. It is what the copy
                  needs to sit off the rules; the drawing below wants the
                  opposite, which is the whole cell edge to edge — a diagram
                  inset by 40px on a 600px cell is a diagram two thirds the
                  size it could be. */}
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-2 text-subtle">
                  <Mark size={16} weight="Filled" strokeWidth={1.5} />
                  <span className="text-base text-muted-foreground text-medium tracking-tight">
                    {skill.tag}
                  </span>
                </div>

                {/* Title and description are one paragraph, not two blocks, the
                  same way the work rail sets its captions: both run `inline`,
                  so the description carries on from the title on the same line
                  and only wraps when the line does. They share one size,
                  weight and leading — the title is told apart by colour alone,
                  and the full stop is what keeps the two halves from reading
                  as a single run-on phrase.

                  The space between them is spelled out: JSX drops whitespace
                  that spans a newline, so without it the two would butt up
                  against each other. */}
                <div className="mt-5 max-w-md text-pretty text-lg font-medium leading-[1.35] tracking-tight">
                  <h3 className="inline text-foreground">{skill.title}.</h3>{" "}
                  <p className="inline text-muted-foreground">
                    {skill.description}
                  </p>
                </div>
              </div>

              {/* No padding, and that is the point: the drawing gets the cell
                  from rule to rule. `flex-1` and a floor so all four sit on
                  the same line however differently the copy above them wraps —
                  without the floor a short cell would crop its drawing, and
                  without the `flex-1` a tall neighbour would leave this one
                  hanging under its text instead of centred in what is left.
                  `pb-` is the one exception: a drawing flush against the
                  closing rule reads as running out of room. */}
              <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden pb-10">
                <SkillVisual slug={skill.slug} locale={locale} />
              </div>
            </Cell>
          );
        })}
      </CellGrid>
    </>
  );
}
