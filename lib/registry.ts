/**
 * Plain data only — this module is imported by Server Components, so it must
 * not pull in any client component.
 *
 * To add a component: create it under `components/library/`, add an entry
 * here, then add a case to `components/library/preview.tsx`.
 *
 * Every `@/` import the component makes goes in its `dependencies` — the page
 * prints the source for people to copy, and those files are not in their
 * project yet.
 *
 * `defaultVersion` picks which version its previews open on.
 */

export type Category = "Navigation" | "Feedback" | "Overlay" | "Form";

export type VersionMeta = {
  id: string;
  label: string;
  description: string;
};

export type ComponentMeta = {
  slug: string;
  name: string;
  category: Category;
  description: string;
  /** Path from the repo root, read at build time to show the source. */
  sourcePath: string;
  /** Import path shown in the usage snippet. */
  importPath: string;
  /**
   * Local files the component imports, shown as their own code blocks under
   * the source so it can be lifted out without chasing missing imports.
   * Paths are from the repo root, and the chain is followed: if a dependency
   * has `@/` imports of its own, those belong here too. Installed packages
   * are not listed — the import statements already name them.
   */
  dependencies?: string[];
  /**
   * The version every preview of this component opens on — the gallery card
   * and its own page both. Must be one of the `versions` ids below; anything
   * else (or leaving it off) falls back to the first version declared.
   */
  defaultVersion?: string;
  versions: VersionMeta[];
};

export const CATEGORIES: Category[] = [
  "Navigation",
  "Feedback",
  "Overlay",
  "Form",
];

export const COMPONENTS: ComponentMeta[] = [
  {
    slug: "navbar",
    name: "Navbar",
    category: "Navigation",
    description:
      "A navigation island that hangs off the top edge, flaring into it with concave corners. The silhouette is identical in every version — only the fill changes.",
    sourcePath: "components/library/navbar.tsx",
    importPath: "@/components/library/navbar",
    // The toggle drags the theme store in behind it.
    dependencies: [
      "components/theme/theme-toggle.tsx",
      "lib/theme.ts",
      "lib/cn.ts",
    ],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description:
          "Opaque background with a hairline rim traced around the full silhouette, concave corners included.",
      },
      {
        id: "solid",
        label: "Solid",
        description: "Filled surface, no rim.",
      },
      {
        id: "blur",
        label: "Blur",
        description:
          "Translucent background over a blurred backdrop, so the wallpaper reads through.",
      },
    ],
  },
  {
    slug: "notification",
    name: "Notification",
    category: "Feedback",
    description:
      "An iOS-inspired notification with an app image, title, message and delivery time.",
    sourcePath: "components/library/notification.tsx",
    importPath: "@/components/library/notification",
    dependencies: ["lib/cn.ts"],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description: "Opaque background with a subtle hairline border.",
      },
      {
        id: "solid",
        label: "Solid",
        description: "A softly filled surface without a visible outline.",
      },
      {
        id: "blur",
        label: "Blur",
        description:
          "A translucent surface that blurs and saturates the backdrop beneath it.",
      },
    ],
  },
  {
    slug: "dropdown",
    name: "Dropdown",
    category: "Overlay",
    description:
      "Open, the panel does not float under the trigger — it grows out of it, running past its right edge as one body. The corner where the trigger's side turns into the panel's top is concave; every other corner on the silhouette is a normal radius.",
    sourcePath: "components/library/dropdown.tsx",
    importPath: "@/components/library/dropdown",
    dependencies: ["lib/cn.ts"],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description: "Outlined trigger and menu on an opaque surface.",
      },
      {
        id: "solid",
        label: "Solid",
        description: "High-contrast filled trigger and menu.",
      },
    ],
  },
  {
    slug: "select",
    name: "Select",
    category: "Overlay",
    description:
      "The dropdown's silhouette with a selection behind it. Open, the listbox grows out of the trigger as one body and shows the current choice back in it; the corner where the trigger's side turns into the panel's top is concave, every other one a normal radius.",
    sourcePath: "components/library/select.tsx",
    importPath: "@/components/library/select",
    dependencies: ["lib/cn.ts"],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description: "Outlined trigger and listbox on an opaque surface.",
      },
      {
        id: "solid",
        label: "Solid",
        description: "High-contrast filled trigger and listbox.",
      },
    ],
  },
  {
    slug: "input",
    name: "Input",
    category: "Form",
    description:
      "The tab strip's silhouette on a text field. A field on its own has no concave corner to give — it is one box, and every corner points outward. The icon plaque earns it: set at the top left and narrower than the body, it leaves the left edge one straight line and puts the only inside corner on its right, where its side turns into the body's top.",
    sourcePath: "components/library/input.tsx",
    importPath: "@/components/library/input",
    dependencies: ["lib/cn.ts"],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description:
          "Opaque body with a hairline rim traced around the full silhouette, concave arc included.",
      },
      {
        id: "solid",
        label: "Solid",
        description:
          "Filled body, no rim, the field cut out of it in the background colour on focus.",
      },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "Navigation",
    description:
      "A strip on its own has no concave corner to give — it is one box, and every corner points outward. The title earns it: set at the top left and narrower than the bar, it leaves the left edge one straight line and puts the only inside corner on its right, where its side turns into the bar's top. The indicator slides between tabs and smears as it travels, with every other label blurring through the move.",
    sourcePath: "components/library/tabs.tsx",
    importPath: "@/components/library/tabs",
    dependencies: ["lib/cn.ts", "lib/use-reduced-motion.ts"],
    defaultVersion: "solid",
    versions: [
      {
        id: "border",
        label: "Border",
        description:
          "Opaque body with a hairline rim traced around the full silhouette, concave arcs included.",
      },
      {
        id: "solid",
        label: "Solid",
        description:
          "Filled body, no rim, the indicator cut out of it in the background colour.",
      },
      {
        id: "blur",
        label: "Blur",
        description:
          "Translucent body over a blurred backdrop, so the wallpaper reads through.",
      },
    ],
  },
];

export function getComponent(slug: string): ComponentMeta | undefined {
  return COMPONENTS.find((component) => component.slug === slug);
}

/**
 * The version a preview opens on, per component — set `defaultVersion` on the
 * entry to pick it. Read by the gallery card and by the component's own page,
 * so the two never disagree. The switcher still lists the versions in their
 * declared order.
 */
export function defaultVersion(meta: ComponentMeta): string {
  const chosen = meta.versions.find(
    (entry) => entry.id === meta.defaultVersion,
  );
  return (chosen ?? meta.versions[0]).id;
}
