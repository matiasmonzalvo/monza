"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/code/code-block";
import { Section } from "@/components/layout/grid";
import {
  ComponentPreview,
  PreviewBackdrop,
  previewFrame,
  previewWidth,
} from "@/components/library/preview";
import { cn } from "@/lib/cn";
import { LANDING_COPY, type Locale } from "@/lib/i18n";
import { type ComponentMeta, defaultVersion } from "@/lib/registry";

export type DependencySource = {
  /** Path from the repo root — also where it goes in the reader's project. */
  path: string;
  source: string;
};

/** `.ts` gets the plain grammar; `tsx` would read a generic as a JSX tag. */
function languageFor(path: string) {
  return path.endsWith(".tsx") ? "tsx" : "typescript";
}

export function ComponentShowcase({
  meta,
  source,
  dependencies = [],
  locale = "en",
}: {
  meta: ComponentMeta;
  source: string;
  dependencies?: DependencySource[];
  locale?: Locale;
}) {
  const copy = LANDING_COPY[locale].componentShowcase;
  const [version, setVersion] = useState(defaultVersion(meta));
  const current =
    meta.versions.find((entry) => entry.id === version) ?? meta.versions[0];

  const usage = [
    `import { ${meta.name} } from "${meta.importPath}";`,
    ``,
    `export default function Example() {`,
    `  return <${meta.name} version="${version}" />;`,
    `}`,
  ].join("\n");

  const filename = meta.sourcePath.split("/").pop() ?? meta.sourcePath;

  return (
    <>
      {/* Header. The navbar floats over the page, so the first band clears
          its height before the title starts. */}
      <Section pluses className="px-6 pb-10 pt-24 sm:px-8 sm:pb-14 sm:pt-28">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-6xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
            {meta.name}
          </h1>
        </div>

        {/* The switcher sits with the title because it renames the whole page
            under it, not just the preview box. */}
        <div
          role="group"
          aria-label={copy.versionLabel}
          className="mt-6 flex flex-wrap gap-1.5"
        >
          {meta.versions.map((entry) => {
            const active = entry.id === version;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setVersion(entry.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Preview + code */}
      <Section bordered={false}>
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
            {copy.preview}
          </span>
        </div>

        {/* Live preview */}
        <div className="relative border-b border-border">
          <div
            // No `overflow-hidden`: the dropdown and select menus are allowed
            // to hang past the box, the way they would over real page content.
            className={cn(
              "relative flex min-h-[300px]",
              previewFrame(meta.slug),
            )}
          >
            <PreviewBackdrop slug={meta.slug} />

            {/* The navbar pins itself to this box, so it has to be positioned. */}
            <div className={cn("relative z-10", previewWidth(meta.slug))}>
              <ComponentPreview
                slug={meta.slug}
                version={version}
                locale={locale}
              />
            </div>
          </div>
        </div>

        {/* What this version changes */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-5 py-4 sm:px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
            {current.label}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {current.description}
          </span>
        </div>

        {/* Usage */}
        <div className="border-b border-border">
          <CodeBlock code={usage} filename={copy.usage} locale={locale} />
        </div>

        {/* Full source */}
        <CodeBlock
          code={source}
          filename={filename}
          maxHeight="560px"
          locale={locale}
          className={dependencies.length > 0 ? "border-b border-border" : ""}
        />

        {/* The local imports the source makes. Without these the block above
            is not copy-pasteable — they resolve through `@/`, which points at
            this repo and nowhere else. */}
        {dependencies.length > 0 ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-5 py-4 sm:px-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                {copy.dependencies}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {copy.dependencyDescription(meta.name)}
              </span>
            </div>

            {dependencies.map((dependency, index) => (
              <CodeBlock
                key={dependency.path}
                code={dependency.source}
                filename={dependency.path}
                language={languageFor(dependency.path)}
                maxHeight="360px"
                locale={locale}
                className={
                  index < dependencies.length - 1
                    ? "border-b border-border"
                    : ""
                }
              />
            ))}
          </>
        ) : null}
      </Section>
    </>
  );
}
