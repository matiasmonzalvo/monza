import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import {
  SEO_COPY,
  createPageMetadata,
  createProfilePageJsonLd,
  serializeJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: SEO_COPY.en.title,
  description: SEO_COPY.en.description,
  path: "/",
  alternatePath: "/es",
  locale: "en",
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createProfilePageJsonLd("en")),
        }}
      />
      <LandingPage locale="en" />
    </>
  );
}
