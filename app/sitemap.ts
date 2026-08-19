import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/registry";
import { absoluteUrl } from "@/lib/seo";

function localizedEntry(
  englishPath: string,
  spanishPath: string,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(englishPath),
    changeFrequency: "monthly",
    priority,
    alternates: {
      languages: {
        en: absoluteUrl(englishPath),
        es: absoluteUrl(spanishPath),
        "x-default": absoluteUrl(englishPath),
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homePages = [
    localizedEntry("/", "/es", 1),
    {
      ...localizedEntry("/", "/es", 1),
      url: absoluteUrl("/es"),
    },
  ];

  const componentPages = COMPONENTS.flatMap((component) => {
    const englishPath = `/components/${component.slug}`;
    const spanishPath = `/es/components/${component.slug}`;

    return [
      localizedEntry(englishPath, spanishPath, 0.7),
      {
        ...localizedEntry(englishPath, spanishPath, 0.7),
        url: absoluteUrl(spanishPath),
      },
    ];
  });

  return [...homePages, ...componentPages];
}
