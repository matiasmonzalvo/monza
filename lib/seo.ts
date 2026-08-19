import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

export const SITE_URL = "https://monzalvo.com";
export const SITE_NAME = "Matias Monzalvo";
export const SITE_ALIAS = "Monza";
export const OG_IMAGE_PATH = "/og-image.png";
export const EMAIL = "matias@monzalvo.com";

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/matias-monzalvo/",
  "https://x.com/matimonzalvo_",
] as const;

export const SEO_COPY = {
  en: {
    title: "Matias Monzalvo — Product Designer & Design Engineer",
    description:
      "Portfolio of Matias Monzalvo, a product designer and design engineer in Buenos Aires creating clear digital products, scalable design systems and web experiences.",
    ogImageAlt:
      "Matias Monzalvo — Product Designer and Design Engineer portfolio",
  },
  es: {
    title: "Matias Monzalvo — Diseñador de Productos Digitales",
    description:
      "Portfolio de Matias Monzalvo, diseñador de productos y design engineer en Buenos Aires, especializado en productos digitales, sistemas de diseño y experiencias web.",
    ogImageAlt:
      "Portfolio de Matias Monzalvo — Diseñador de Productos y Design Engineer",
  },
} as const;

const OG_LOCALES: Record<Locale, "en_US" | "es_AR"> = {
  en: "en_US",
  es: "es_AR",
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  alternatePath: string;
  locale: Locale;
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createMetaDescription(description: string, maxLength = 160) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const shortened = normalized.slice(0, maxLength - 1);
  const lastWordBoundary = shortened.lastIndexOf(" ");
  const cutoff = lastWordBoundary > 0 ? lastWordBoundary : shortened.length;

  return `${shortened.slice(0, cutoff)}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  alternatePath,
  locale,
}: PageMetadataOptions): Metadata {
  const alternateLocale: Locale = locale === "en" ? "es" : "en";
  const englishPath = locale === "en" ? path : alternatePath;
  const spanishPath = locale === "es" ? path : alternatePath;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: {
        en: englishPath,
        es: spanishPath,
        "x-default": englishPath,
      },
    },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: [OG_LOCALES[alternateLocale]],
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: SEO_COPY[locale].ogImageAlt,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@matimonzalvo_",
      images: [
        {
          url: OG_IMAGE_PATH,
          alt: SEO_COPY[locale].ogImageAlt,
        },
      ],
    },
  };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: SITE_NAME,
      alternateName: SITE_ALIAS,
      url: `${SITE_URL}/`,
      image: absoluteUrl(OG_IMAGE_PATH),
      email: `mailto:${EMAIL}`,
      jobTitle: ["Product Designer", "Design Engineer"],
      description: SEO_COPY.en.description,
      sameAs: SOCIAL_PROFILES,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Buenos Aires",
        addressCountry: "AR",
      },
      knowsAbout: [
        "Product design",
        "Design engineering",
        "User experience design",
        "User interface design",
        "Design systems",
        "Web development",
        "Artificial intelligence products",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: SITE_ALIAS,
      description: SEO_COPY.en.description,
      inLanguage: ["en", "es"],
      creator: { "@id": `${SITE_URL}/#person` },
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export function createProfilePageJsonLd(locale: Locale) {
  const path = locale === "es" ? "/es" : "/";

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteUrl(path)}#profile-page`,
    url: absoluteUrl(path),
    name: SEO_COPY[locale].title,
    description: SEO_COPY[locale].description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(OG_IMAGE_PATH),
      width: 1200,
      height: 630,
    },
  };
}

export function createComponentJsonLd({
  name,
  description,
  slug,
  locale,
}: {
  name: string;
  description: string;
  slug: string;
  locale: Locale;
}) {
  const path = `${locale === "es" ? "/es" : ""}/components/${slug}`;
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#source-code`,
    url,
    name:
      locale === "es"
        ? `${name} — componente UI para React`
        : `${name} React UI component`,
    description,
    inLanguage: locale,
    programmingLanguage: {
      "@type": "ComputerLanguage",
      name: "TypeScript",
    },
    runtimePlatform: "Web browser",
    codeSampleType: "full solution",
    author: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
