import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Reads a component's own source so the docs page always shows what actually
 * ships. Runs at build time — every route using it is statically generated.
 */
export async function readSource(relativePath: string): Promise<string> {
  try {
    const absolute = path.join(process.cwd(), relativePath);
    return (await readFile(absolute, "utf8")).trimEnd();
  } catch {
    return `// Could not read ${relativePath}`;
  }
}
