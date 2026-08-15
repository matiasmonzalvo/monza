import type { ReactNode, SVGProps } from "react";
import {
  ClaudeCode,
  CodexOpenai,
  Cursor,
  Expo,
  Figma,
  Framer,
  Illustrator,
  Nextdotjs,
  Nodedotjs,
  Paper,
  Photoshop,
  Postgresql,
  React as ReactMark,
  Reactnative,
  Supabase,
  Tailwindcss,
  Typescript,
  Vercel,
} from "@thesvg/react";

/**
 * ────────────────────────────────────────────────────────────────
 *  TECH MARKS — the real logos, from theSVG.
 *
 *  `@thesvg/react` proper, not paths copied out of it: every mark below is the
 *  brand's own artwork, in colour, kept current by `npm update` rather than by
 *  someone noticing a redraw has gone stale. They render as Server Components
 *  and the package tree-shakes, so the eighteen imported here are the eighteen
 *  that ship.
 *
 *  ────────────────────────────────────────────────────────────────
 *  WHY SOME OF THEM ARE NOT IN COLOUR
 *
 *  Because they have no colour. Vercel, Next.js, Framer, Cursor, Codex and
 *  Expo are monochrome marks by brand — theSVG ships their `default` as a hard
 *  #fff or a near-black #000020, which is a logo that disappears into exactly
 *  one of this site's two themes. For those six the `mono` variant is the
 *  faithful rendering, not a downgrade: it draws in `currentColor`, so the
 *  mark is black on the light theme and white on the dark one, which is what
 *  the brand guidelines ask for anyway.
 *
 *  Everything else is `default`, which is the full-colour artwork — Figma's
 *  five, Supabase's green, TypeScript's blue, Tailwind's gradient. Claude Code
 *  is the one that names its colour variant explicitly, so it asks for it.
 *
 *  ────────────────────────────────────────────────────────────────
 *  THE SHAPE OF AN ENTRY
 *
 *  `mark` is a function rather than the component itself, and that is load
 *  bearing. Each icon types its own `variant` as a union of just the variants
 *  it has, so a record of bare components could not carry the variant with
 *  them without widening it to `string` and losing the check. Pinning the
 *  variant inside a one-line wrapper keeps every one of them verified against
 *  its own union, and hands the caller a plain component that takes any SVG
 *  prop — including `x` and `y`, which is what lets the AI diagram drop these
 *  straight into its own `<svg>` as nested ones.
 * ────────────────────────────────────────────────────────────────
 */

export type MarkProps = SVGProps<SVGSVGElement>;

export type TechMark = {
  /** Printed next to the mark in the marquee. */
  label: string;
  mark: (props: MarkProps) => ReactNode;
};

export const TECH = {
  // The three that feed the AI diagram.
  claude: {
    label: "Claude Code",
    mark: (p: MarkProps) => <ClaudeCode variant="color" {...p} />,
  },
  codex: {
    label: "Codex",
    mark: (p: MarkProps) => <CodexOpenai variant="mono" {...p} />,
  },
  cursor: {
    label: "Cursor",
    mark: (p: MarkProps) => <Cursor variant="mono" {...p} />,
  },

  // Code.
  react: {
    label: "React",
    mark: (p: MarkProps) => <ReactMark {...p} />,
  },
  nextjs: {
    label: "Next.js",
    mark: (p: MarkProps) => <Nextdotjs variant="mono" {...p} />,
  },
  typescript: {
    label: "TypeScript",
    mark: (p: MarkProps) => <Typescript {...p} />,
  },
  tailwind: {
    label: "Tailwind CSS",
    mark: (p: MarkProps) => <Tailwindcss {...p} />,
  },
  node: {
    label: "Node.js",
    mark: (p: MarkProps) => <Nodedotjs {...p} />,
  },

  // Design.
  figma: {
    label: "Figma",
    mark: (p: MarkProps) => <Figma {...p} />,
  },
  photoshop: {
    label: "Photoshop",
    mark: (p: MarkProps) => <Photoshop {...p} />,
  },
  illustrator: {
    label: "Illustrator",
    mark: (p: MarkProps) => <Illustrator {...p} />,
  },
  paper: {
    label: "Paper",
    mark: (p: MarkProps) => <Paper {...p} />,
  },
  framer: {
    label: "Framer",
    mark: (p: MarkProps) => <Framer variant="mono" {...p} />,
  },

  // Product and platform.
  reactNative: {
    label: "React Native",
    mark: (p: MarkProps) => <Reactnative {...p} />,
  },
  expo: {
    label: "Expo",
    mark: (p: MarkProps) => <Expo variant="mono" {...p} />,
  },
  supabase: {
    label: "Supabase",
    mark: (p: MarkProps) => <Supabase {...p} />,
  },
  postgres: {
    label: "PostgreSQL",
    mark: (p: MarkProps) => <Postgresql {...p} />,
  },
  vercel: {
    label: "Vercel",
    mark: (p: MarkProps) => <Vercel variant="mono" {...p} />,
  },
} satisfies Record<string, TechMark>;

export type TechName = keyof typeof TECH;

/**
 * A mark on its own, square, at whatever size the caller asks for.
 *
 * `text-foreground` goes on all of them and not only the monochrome six. A
 * colour mark specifies a fill on every one of its own paths, so the inherited
 * colour never reaches it — which means one rule covers both kinds and there
 * is no flag to keep in sync with the list above.
 */
export function TechIcon({
  name,
  size = 18,
  className = "",
}: {
  name: TechName;
  size?: number;
  className?: string;
}) {
  const Mark = TECH[name].mark;
  return (
    <Mark
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`text-foreground ${className}`.trim()}
    />
  );
}
