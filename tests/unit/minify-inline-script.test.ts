import { describe, expect, it } from "vitest"

import marketingPixelBootstrapSource from "@/lib/marketing-pixel-bootstrap.ts?raw"
import { marketingPixelBootstrapInline } from "@/lib/marketing-pixel-bootstrap-inline"
import { minifyInlineScript } from "@/lib/minify-inline-script"

describe("minifyInlineScript", () => {
  it("minifies marketing pixel bootstrap without breaking IIFE", () => {
    const minified = minifyInlineScript(marketingPixelBootstrapSource)
    expect(minified).toContain("engageMarketingPixels")
    expect(minified).not.toMatch(/\n\s+function armAfterFullLoad/)
    expect(minified.length).toBeLessThan(marketingPixelBootstrapSource.length)
    expect(marketingPixelBootstrapInline).toBe(minified)
  })
})