"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "reicon-react";
import { Cell, CellGrid, Eyebrow } from "@/components/layout/grid";
import {
  ComponentPreview,
  PreviewBackdrop,
  previewFrame,
} from "@/components/library/preview";
import { cn } from "@/lib/cn";
import {
  CATEGORIES,
  COMPONENTS,
  type Category,
  defaultVersion,
} from "@/lib/registry";

type Filter = "All" | Category;

const FILTERS: Filter[] = ["All", ...CATEGORIES];

export function ComponentLibrary() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      filter === "All"
        ? COMPONENTS
        : COMPONENTS.filter((entry) => entry.category === filter),
    [filter],
  );

  const countFor = (value: Filter) =>
    value === "All"
      ? COMPONENTS.length
      : COMPONENTS.filter((entry) => entry.category === value).length;

  return (
    <>
      {/* Title + filters */}
      <div className="border-b border-border px-6 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-8 items-center justify-center w-full py-10">
          <div className="max-w-xl space-y-3">
            <h2 className="text-6xl font-medium leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
              Components
            </h2>
          </div>

          <div
            role="group"
            aria-label="Filter components by category"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((value) => {
              const active = value === filter;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {value}
                  <span
                    className={cn(
                      "font-mono text-[11px]",
                      active ? "opacity-60" : "text-subtle",
                    )}
                  >
                    {countFor(value)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <CellGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => (
          <Cell
            key={entry.slug}
            className="group flex flex-col transition-colors hover:bg-surface"
          >
            {/* Decorative preview. `inert` keeps its own links and buttons out
                of the tab order — and out of the card link, since an <a> may
                never contain another <a>. */}
            <div
              inert
              className={cn(
                "relative flex h-72 overflow-hidden border-b border-border",
                previewFrame(entry.slug, true),
              )}
            >
              <PreviewBackdrop slug={entry.slug} />

              <div className="pointer-events-none relative z-10 flex w-full origin-top scale-[0.82] justify-center">
                <ComponentPreview
                  slug={entry.slug}
                  version={defaultVersion(entry)}
                  compact
                />
              </div>
            </div>

            <div className="flex flex-1 justify-between gap-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {entry.name}
                </span>
              </div>

              <button className="flex justify-center items-center px-3 py-1 text-[13px] text-white font-medium bg-primary rounded-lg ">
                View
              </button>
            </div>

            {/* Covers the whole cell — the card's only interactive element. */}
            <Link
              href={`/components/${entry.slug}`}
              aria-label={`View ${entry.name}`}
              className="absolute inset-0 z-10"
            />
          </Cell>
        ))}
      </CellGrid>
    </>
  );
}
