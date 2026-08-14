/**
 * ────────────────────────────────────────────────────────────────
 *  SKILLS & EXPERIENCE — the block the seam plugs into.
 *
 *  Heading and standfirst only, by design: the body underneath is where the
 *  stack, the timeline or whatever ends up carrying the detail will go, and it
 *  is left empty rather than filled with a placeholder that would have to be
 *  argued with later.
 *
 *  Nothing draws a rule along its top edge, here or in `page.tsx`. The line
 *  there is the underside of the seam's lower connector, which is this block's
 *  own start: it reaches up out of here to meet the one coming down.
 * ────────────────────────────────────────────────────────────────
 */
export function Skills() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center sm:px-8 md:py-32">
      <h2 className="text-6xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
        Skills &amp; Experience
      </h2>
      <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
        The tools, the languages and the systems behind everything above — and
        the years that put them there.
      </p>

      {/* Body goes here. */}
    </div>
  );
}
