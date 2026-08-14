export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3 border-x border-border px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-subtle">
          © {new Date().getFullYear()} Monza. Designed and built in the open.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
          Next.js · Tailwind · WebGL
        </p>
      </div>
    </footer>
  );
}
