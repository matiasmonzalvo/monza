import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Absolute so they also work from /components/[slug].
const NAV = [
  { label: "Work", href: "/#work" },
  { label: "Components", href: "/#components" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between border-x border-border px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rotate-45 border border-foreground"
          />
          <span className="text-sm font-medium tracking-tight text-foreground">
            Monza
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="hidden h-8 items-center rounded-full border border-foreground bg-foreground px-3.5 text-[13px] font-medium text-background transition-colors hover:bg-transparent hover:text-foreground sm:inline-flex"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </header>
  );
}
