"use client";

import { Highlight, type PrismTheme } from "prism-react-renderer";
import { useEffect, useState } from "react";
import { Check, Copy } from "reicon-react";
import { cn } from "@/lib/cn";
import { LANDING_COPY, type Locale } from "@/lib/i18n";

/**
 * Every colour is a CSS variable, so one theme object serves both schemes:
 * the palette flips with the `.dark` class on <html>, with no re-render and
 * no second copy of the theme to keep in sync. Values live in `globals.css`.
 */
const THEME: PrismTheme = {
  plain: { color: "var(--syntax-plain)", backgroundColor: "transparent" },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "var(--syntax-comment)", fontStyle: "italic" },
    },
    { types: ["punctuation"], style: { color: "var(--syntax-punctuation)" } },
    {
      types: ["keyword", "control-flow", "module", "imports", "boolean", "null"],
      style: { color: "var(--syntax-keyword)" },
    },
    {
      types: ["operator", "entity", "url", "spread", "arrow"],
      style: { color: "var(--syntax-operator)" },
    },
    {
      types: ["string", "char", "attr-value", "template-string", "inserted"],
      style: { color: "var(--syntax-string)" },
    },
    {
      types: ["number", "constant", "symbol", "regex"],
      style: { color: "var(--syntax-number)" },
    },
    {
      types: ["function", "method", "function-variable"],
      style: { color: "var(--syntax-function)" },
    },
    {
      types: ["class-name", "maybe-class-name", "builtin"],
      style: { color: "var(--syntax-class)" },
    },
    { types: ["tag"], style: { color: "var(--syntax-tag)" } },
    {
      types: ["attr-name", "property"],
      style: { color: "var(--syntax-attr)" },
    },
    {
      types: ["variable", "parameter", "plain-text"],
      style: { color: "var(--syntax-plain)" },
    },
    { types: ["deleted"], style: { color: "var(--syntax-deleted)" } },
  ],
};

export function CodeBlock({
  code,
  filename,
  className,
  language = "tsx",
  maxHeight = "none",
  locale = "en",
}: {
  code: string;
  filename?: string;
  className?: string;
  language?: string;
  maxHeight?: string;
  locale?: Locale;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
          {filename ?? "Code"}
        </span>
        <CopyButton value={code} locale={locale} />
      </div>

      {/* Only ever scrolls vertically — long lines wrap instead. */}
      <div
        className="min-w-0 overflow-x-hidden overflow-y-auto"
        style={{ maxHeight }}
      >
        <Highlight theme={THEME} code={code.trimEnd()} language={language}>
          {({
            className: prismClass,
            style,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre
              style={style}
              className={cn(
                "min-w-0 whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-[1.7]",
                prismClass,
              )}
            >
              {tokens.map((line, index) => (
                <span
                  key={index}
                  {...getLineProps({
                    line,
                    // Hanging indent: the padding shifts the whole line right
                    // and the negative indent pulls its *first* row back, so a
                    // wrapped line stays visibly a continuation of the one above.
                    className: "block pl-8 -indent-8",
                  })}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}

export function CopyButton({
  value,
  locale = "en",
}: {
  value: string;
  locale?: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const copy = LANDING_COPY[locale].componentShowcase;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard unavailable (insecure origin or denied permission).
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
    >
      {copied ? (
        <>
          <Check
            size={14}
            weight="Outline"
            strokeWidth={2}
            aria-hidden="true"
            className="text-success"
          />
          {copy.copied}
        </>
      ) : (
        <>
          <Copy size={14} weight="Outline" aria-hidden="true" />
          {copy.copy}
        </>
      )}
    </button>
  );
}
