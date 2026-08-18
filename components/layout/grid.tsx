import type { ReactNode } from "react";
import { Plus as PlusIcon } from "reicon-react";

/**
 * ────────────────────────────────────────────────────────────────
 *  THE GUTTER — the air the rails keep from the screen edge.
 *
 *  On a wide screen the column is narrower than the viewport and there is
 *  nothing here to do. Once the viewport comes down to the column's own width
 *  the two meet, and the rails end up drawn on the very first and last pixel
 *  of the screen: the grid stops reading as a column with sides and starts
 *  reading as one that has been cropped off.
 *
 *  So every element that draws a rail is inset by this much. It has to be
 *  padding on a PARENT, never on the railed element itself — the rail is that
 *  element's own border, so its own padding falls inside the line and moves
 *  nothing.
 *
 *  Opting out is just not using it: the work carousel's track and the seam's
 *  canvas both run to the screen edge on purpose, and neither draws a rail.
 * ────────────────────────────────────────────────────────────────
 */
export const GUTTER = "px-3";

/**
 * Small "+" drawn centred on a border intersection. Purely decorative.
 */
export function Plus({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 h-[11px] w-[11px] text-border-strong ${className}`.trim()}
    >
      <PlusIcon
        size={11}
        weight="Outline"
        strokeWidth={1}
        className="h-full w-full"
      />
    </span>
  );
}

/**
 * The four intersection marks around a block. The parent must be `relative`.
 */
export function CornerPluses({ bottom = true }: { bottom?: boolean }) {
  return (
    <>
      <Plus className="-left-[6px] -top-[6px]" />
      <Plus className="-right-[6px] -top-[6px]" />
      {bottom ? (
        <>
          <Plus className="-bottom-[6px] -left-[6px]" />
          <Plus className="-bottom-[6px] -right-[6px]" />
        </>
      ) : null}
    </>
  );
}

/**
 * The page column: a fixed max width with the vertical rails that every
 * section hangs off of.
 */
export function Frame({
  children,
  className = "",
  capped = false,
  cappedBottom = false,
}: {
  children: ReactNode;
  className?: string;
  /** Draws and rounds the frame's opening edge without changing other frames. */
  capped?: boolean;
  /** Draws and rounds the frame's closing edge without changing other frames. */
  cappedBottom?: boolean;
}) {
  return (
    // The outer box carries the gutter and nothing else, so the column below
    // it keeps its exact desktop width and only starts giving ground once the
    // viewport is narrower than the two of them together.
    <div className={GUTTER}>
      <div
        className={`mx-auto w-full max-w-6xl border-x border-border ${capped ? "rounded-t-4xl border-t" : ""} ${cappedBottom ? "rounded-b-4xl border-b" : ""}`.trim()}
      >
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}

/**
 * A horizontal band inside the frame. Sections stack and are separated by
 * their bottom rule.
 */
export function Section({
  children,
  id,
  className = "",
  bordered = true,
  pluses = false,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  bordered?: boolean;
  pluses?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative ${bordered ? "border-b border-border" : ""} ${className}`.trim()}
    >
      {pluses ? <CornerPluses /> : null}
      {children}
    </section>
  );
}

/**
 * Cells draw their own top/left rule; the container pulls the outer rules
 * back under the frame so nothing doubles up. Ragged final rows stay clean
 * because no cell ever draws a rule it does not own.
 */
export function CellGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`-ml-px -mt-px grid ${className}`.trim()}>{children}</div>
  );
}

export function Cell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative border-l border-t border-border ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/**
 * Diagonal hatch used to fill deliberately empty grid space.
 */
export function Hatch({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-hatch opacity-40 ${className}`.trim()}
    />
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.14em] text-subtle ${className}`.trim()}
    >
      {children}
    </p>
  );
}
