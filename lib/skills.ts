import type { Locale } from "@/lib/i18n";

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
    title: "I use AI as part of my day-to-day work",
    tag: "AI-first",
    description:
      "I move between several tools depending on the task, give them context and constraints, and review what they produce before using it.",
  },
  {
    slug: "education",
    title: "I'm in the final year of my university degree",
    tag: "Education",
    description:
      "I have also learned through a Cambridge C1, hackathons, courses, side projects, sales, and years of customer support. Each experience has given me a different way to approach the work.",
  },
  {
    slug: "ux-ui",
    title: "I like making interfaces clear and consistent",
    tag: "UX / UI",
    description:
      "I use simple systems for spacing, type, and states, and I try to make every screen easy to understand and use on any screen or device.",
  },
  {
    slug: "stack",
    title: "I use different tools for different kinds of work",
    tag: "Stack",
    description:
      "My day-to-day moves from design and front-end code to databases, deployment, and AI tools, depending on what the task needs.",
  },
];

const SKILLS_ES_COPY: Record<
  SkillItem["slug"],
  Pick<SkillItem, "title" | "tag" | "description">
> = {
  "ai-first": {
    title: "Uso la IA como parte de mi trabajo diario",
    tag: "IA primero",
    description:
      "Elijo entre distintas herramientas según la tarea, les doy contexto y restricciones, y reviso lo que producen antes de usarlo.",
  },
  education: {
    title: "Estoy en el último año de mi carrera universitaria",
    tag: "Formación",
    description:
      "También aprendí mediante un Cambridge C1, hackatones, cursos, proyectos propios, ventas y años de atención al cliente. Cada experiencia me dio una manera diferente de abordar el trabajo.",
  },
  "ux-ui": {
    title: "Me gusta crear interfaces claras y consistentes",
    tag: "UX / UI",
    description:
      "Uso sistemas simples para el espaciado, la tipografía y los estados, y busco que cada pantalla sea fácil de entender y usar en cualquier dispositivo.",
  },
  stack: {
    title: "Uso distintas herramientas para cada tipo de trabajo",
    tag: "Tecnologías",
    description:
      "Mi día a día abarca desde el diseño y el código front-end hasta bases de datos, despliegues y herramientas de IA, según lo que necesite cada tarea.",
  },
};

export function getSkills(locale: Locale): SkillItem[] {
  if (locale === "en") return SKILLS;

  return SKILLS.map((skill) => ({
    ...skill,
    ...SKILLS_ES_COPY[skill.slug],
  }));
}
