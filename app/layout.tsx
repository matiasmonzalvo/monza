import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { SmoothScroll } from "@/components/scroll/smooth-scroll";
import {
  SEO_COPY,
  SITE_ALIAS,
  SITE_NAME,
  SITE_URL,
  serializeJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_COPY.en.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_COPY.en.description,
  applicationName: `${SITE_NAME} Portfolio`,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    SITE_NAME,
    SITE_ALIAS,
    "product designer",
    "design engineer",
    "UX/UI designer",
    "digital product design",
    "design systems",
    "web development",
    "Buenos Aires product designer",
  ],
  category: "technology",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    google: "notranslate",
  },
};

/**
 * Provides a server-rendered fallback for mobile browser chrome. The blocking
 * theme script replaces these values before first paint when the visitor uses
 * the light theme or follows a light system preference.
 */
export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

/**
 * Runs before first paint so the stored theme is applied without a flash.
 * Kept as a plain string: it must not depend on the React bundle.
 */
const themeScript = `
(function () {
  function applyTheme(theme) {
    var root = document.documentElement;
    var themeColor = theme === 'dark' ? '#000000' : '#ffffff';
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');
    var colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.style.backgroundColor = themeColor;
    if (themeColorMeta) themeColorMeta.setAttribute('content', themeColor);
    if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', theme);
  }

  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);
  } catch (e) {
    applyTheme('dark');
  }
})();
`;

/** Keeps the document language aligned with the explicit /es route. */
const localeScript = `
(function () {
  var path = window.location.pathname;
  document.documentElement.lang = path === '/es' || path.indexOf('/es/') === 0
    ? 'es'
    : 'en';
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      translate="no"
      suppressHydrationWarning
      className={`${inter.variable} antialiased dark notranslate`}
    >
      <body className="bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Script id="locale-init" strategy="beforeInteractive">
          {localeScript}
        </Script>

        {/* Lives out here, not in the pages, because the smooth wrapper
            transforms everything inside it — and a transformed ancestor is
            what `position: fixed` resolves against. In there, the bar would
            scroll away with the page. */}
        <LandingNavbar version="border" />

        {/* The column that used to sit on <body> moved onto the smooth
            content, which is now the element the page actually stacks in. */}
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
