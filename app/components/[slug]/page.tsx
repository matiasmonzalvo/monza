import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Frame } from "@/components/layout/grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { ComponentShowcase } from "@/components/library/showcase";
import { COMPONENTS, getComponent } from "@/lib/registry";
import { readSource } from "@/lib/source";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPONENTS.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const meta = getComponent(slug);

  if (!meta) return { title: "Not found — Monza" };

  return {
    title: `${meta.name} — Monza`,
    description: meta.description,
  };
}

export default async function ComponentPage({ params }: Params) {
  const { slug } = await params;
  const meta = getComponent(slug);

  if (!meta) notFound();

  const source = await readSource(meta.sourcePath);
  // Read alongside the source so the page ships everything the component
  // needs, not just the file that carries its name.
  const dependencies = await Promise.all(
    (meta.dependencies ?? []).map(async (path) => ({
      path,
      source: await readSource(path),
    })),
  );

  return (
    <>
      <main className="flex-1">
        <Frame>
          {/* Heading, preview and code all hang off the selected version, so
              they travel together as one client component. */}
          <ComponentShowcase
            meta={meta}
            source={source}
            dependencies={dependencies}
          />
        </Frame>
      </main>

      <SiteFooter />
    </>
  );
}
