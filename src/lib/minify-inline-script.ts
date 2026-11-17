import { transformSync } from "esbuild"

/** Minify a browser script snippet for `is:inline` / `set:html` (build time only). */
export function minifyInlineScript(source: string): string {
  const result = transformSync(source, {
    loader: "ts",
    minify: true,
    legalComments: "none",
    target: "es2018",
    charset: "utf8",
  })
  return result.code
}