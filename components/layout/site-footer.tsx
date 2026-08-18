import { GUTTER } from "@/components/layout/grid";

export function SiteFooter() {
  return (
    // The gutter sits on the footer itself: its own rule is a top border, so
    // it is drawn on the border box and stays edge to edge, while the padding
    // only moves the railed column inside it.
    <footer className={`border-t border-border ${GUTTER}`}>
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
