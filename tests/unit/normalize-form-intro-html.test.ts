import { describe, expect, it } from "vitest"

import { normalizeFormIntroHtml } from "@/lib/normalize-form-intro-html"

describe("normalizeFormIntroHtml", () => {
  it("removes nbsp-prefixed list rows from Airtable", () => {
    const input = `<ul>
\u00a0<li>A</li>
\u00a0<li>B</li>
</ul>`
    expect(normalizeFormIntroHtml(input)).toBe("<ul><li>A</li><li>B</li></ul>")
  })

  it("leaves paragraph spacing markup intact", () => {
    const input = "<p>Uno</p>\n\n<p>Dos</p>"
    expect(normalizeFormIntroHtml(input)).toBe("<p>Uno</p><p>Dos</p>")
  })
})