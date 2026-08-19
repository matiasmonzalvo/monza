import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import {
  SEO_COPY,
  createPageMetadata,
  createProfilePageJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: SEO_COPY.es.title,
  description: SEO_COPY.es.description,
  path: "/es",
  alternatePath: "/",
  locale: "es",
});

export default function SpanishHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createProfilePageJsonLd("es")),
        }}
      />
      <LandingPage locale="es" />
    </>
  );
}
