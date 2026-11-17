import marketingPixelBootstrapSource from "@/lib/marketing-pixel-bootstrap.ts?raw"

import { minifyInlineScript } from "@/lib/minify-inline-script"

/** Esbuild-minified marketing bootstrap for `MarketingHead` `is:inline` script. */
export const marketingPixelBootstrapInline = minifyInlineScript(
  marketingPixelBootstrapSource,
)