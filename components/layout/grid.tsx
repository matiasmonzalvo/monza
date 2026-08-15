import type { ReactNode } from "react";
import { Plus as PlusIcon } from "reicon-react";

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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl border-x border-border">
      <div className={className}>{children}</div>
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
