import { describe, expect, it } from "vitest"

import {
  prefixThankYouFirstParagraph,
  prefixThankYouFirstParagraphHtml,
} from "@/lib/form-thank-you"
import { renderFormBodyMarkdown } from "@/lib/render-form-body-markdown"

describe("thank-you markdown", () => {
  it("renders bold italic in thank-you copy", async () => {
    const html = await renderFormBodyMarkdown(
      "Bienvenido a _**Alicia Privé**_, estás un paso más cerca."
    )
    expect(html).toContain("<em><strong>Alicia Privé</strong></em>")
    expect(html).not.toContain("_**")
  })

  it("prefixes first name in rendered HTML when DOMParser is available", async () => {
    if (typeof DOMParser === "undefined") {
      return
    }
    const html = await renderFormBodyMarkdown(
      "Bienvenido a _**Alicia Privé**_, estás un paso más cerca."
    )
    const prefixed = prefixThankYouFirstParagraphHtml(html, "Bruno", "es")
    expect(prefixed).toMatch(/^<p>Bruno, /)
    expect(prefixed).toContain("<em><strong>Alicia Privé</strong></em>")
  })

  it("keeps plain-text prefix helper for non-HTML callers", () => {
    expect(
      prefixThankYouFirstParagraph(
        "Bienvenido a Alicia Privé",
        "Bruno",
        "es"
      )
    ).toBe("Bruno, bienvenido a Alicia Privé")
  })
})