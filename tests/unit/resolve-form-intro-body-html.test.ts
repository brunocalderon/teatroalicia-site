import { describe, expect, it } from "vitest"

import {
  resolveFormIntroBodyHtml,
} from "@/lib/render-form-body-markdown"

describe("resolveFormIntroBodyHtml", () => {
  it("strips Airtable NBSP gaps between list items", async () => {
    const html =
      "<ul>\n\u00a0<li>uno</li>\n\u00a0<li>dos</li>\n</ul>"
    const out = await resolveFormIntroBodyHtml(html, "html")
    expect(out).toBe("<ul><li>uno</li><li>dos</li></ul>")
  })

  it("renders markdown to HTML", async () => {
    const out = await resolveFormIntroBodyHtml("## Hola", "markdown")
    expect(out).toContain("<h2")
    expect(out).toContain("Hola")
  })
})