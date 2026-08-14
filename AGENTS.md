<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working rules

The owner of this repo verifies the app themselves. Do not try to verify it for them.

## Do not run builds, linters or type checks

Never run `next build`, `next dev`, `eslint`/`npm run lint`, `tsc`, or any test/verification command. The owner runs these and checks the results.

Write the code, then hand it over and say plainly what was changed and what has **not** been verified. Do not claim something works when you have not seen it work.

## Do not open browser tabs

Never open, navigate, or drive a browser — no `preview_start`, no browser/preview tools, no dev server. The owner opens the site themselves.

Do not create or edit `.claude/launch.json` for this purpose.

# Adding a library component

A component's page prints its source for people to copy into their own project. Anything it imports through `@/` resolves to this repo and nowhere else, so on its own that source does not compile for them — the copyable unit is the component **plus every local file it reaches**.

So when you add or change a component under `components/library/`, read its imports and list each `@/` one in `dependencies` on its `lib/registry.ts` entry, as a path from the repo root. Follow the chain: if a dependency has `@/` imports of its own, those go in the list too. `app/components/[slug]/page.tsx` reads them and `components/library/showcase.tsx` renders a code block per file.

Installed packages (`react`, `reicon-react`, `prism-react-renderer`) stay out — the import statements already name them and `npm i` is the fix.

The rest of the wiring is in the header comment of `lib/registry.ts`.
