import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { SmoothScroll } from "@/components/scroll/smooth-scroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monza — Product Designer",
  description:
    "Product designer building clear, systematic interfaces. Portfolio and UI component library.",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} antialiased dark`}
    >
      <body className="bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
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
