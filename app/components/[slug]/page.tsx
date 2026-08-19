import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Frame } from "@/components/layout/grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { ComponentShowcase } from "@/components/library/showcase";
import { COMPONENTS, getComponent } from "@/lib/registry";
import {
  createComponentJsonLd,
  createMetaDescription,
  createPageMetadata,
  serializeJsonLd,
} from "@/lib/seo";
import { readSource } from "@/lib/source";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPONENTS.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const meta = getComponent(slug);

  if (!meta) {
    return {
      title: "Component not found",
      robots: { index: false, follow: false },
    };
  }

  const description = createMetaDescription(meta.description);

  return createPageMetadata({
    title: `${meta.name} UI Component — React & TypeScript`,
    description,
    path: `/components/${meta.slug}`,
    alternatePath: `/es/components/${meta.slug}`,
    locale: "en",
  });
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
  const jsonLd = createComponentJsonLd({
    name: meta.name,
    description: meta.description,
    slug: meta.slug,
    locale: "en",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <main lang="en" className="flex-1">
        <Frame>
          {/* Heading, preview and code all hang off the selected version, so
              they travel together as one client component. */}
          <ComponentShowcase
            meta={meta}
            source={source}
            dependencies={dependencies}
            locale="en"
          />
        </Frame>
      </main>

      <SiteFooter locale="en" />
    </>
  );
}
