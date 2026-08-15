/**
 * The four cells of the skills grid, in reading order — top-left, top-right,
 * bottom-left, bottom-right.
 *
 * Plain data, like `lib/work.ts`: no component lands in here, not even an
 * icon. Each entry is paired with a drawing by its `slug`, and that pairing
 * lives in `components/sections/skill-visuals.tsx` — add an entry here, add a
 * case there. The eyebrow's icon is paired the same way, in `skills.tsx`.
 *
 * Four and not seven on purpose. The old rail listed every line of a CV; these
 * are the four things the rest of it rolls up into, which is why the copy for
 * each one has to carry more than a label did.
 *
 * `description` runs on from the title as one sentence, so it is written to be
 * read that way: the title, a full stop, then the line continuing from it.
 */
export type SkillItem = {
  slug: string;
  title: string;
  tag: string;
  description: string;
};

export const SKILLS: SkillItem[] = [
  {
    slug: "ai-first",
    title: "Built with models, not around them",
    tag: "AI-first",
    description:
      "A method rather than a habit — context and constraints set before the first line, the work split across tools that each do one thing well, and every pass reviewed before it counts as done.",
  },
  {
    slug: "education",
    title: "Everything arrives at the same place",
    tag: "Education",
    description:
      "The degree in its final year, a Cambridge C1, a podium at a Siemens hackathon, courses, side projects, and years on the phone with real customers. None of it was one path.",
  },
  {
    slug: "ux-ui",
    title: "Decisions you can measure",
    tag: "UX / UI",
    description:
      "Interfaces designed on a system rather than by eye: one spacing scale, one type ramp, states drawn before they are needed, and every screen answering what the person is meant to do next.",
  },
  {
    slug: "stack",
    title: "The tools it gets built in",
    tag: "Stack",
    description:
      "Design and engineering on the same set of hands — from the file the idea is drawn in to the app store build and the database behind it.",
  },
];
