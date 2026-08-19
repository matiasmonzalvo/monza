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
  const meta = getComponent(slug, "es");

  if (!meta) {
    return {
      title: "Componente no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const description = createMetaDescription(meta.description);

  return createPageMetadata({
    title: `${meta.name} — Componente UI para React y TypeScript`,
    description,
    path: `/es/components/${meta.slug}`,
    alternatePath: `/components/${meta.slug}`,
    locale: "es",
  });
}

export default async function SpanishComponentPage({ params }: Params) {
  const { slug } = await params;
  const meta = getComponent(slug, "es");

  if (!meta) notFound();

  const source = await readSource(meta.sourcePath);
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
    locale: "es",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <main lang="es" className="flex-1">
        <Frame>
          <ComponentShowcase
            meta={meta}
            source={source}
            dependencies={dependencies}
            locale="es"
          />
        </Frame>
      </main>

      <SiteFooter locale="es" />
    </>
  );
}
