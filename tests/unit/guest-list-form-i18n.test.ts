import { describe, expect, it } from "vitest"

import { guestListFormEs } from "../../content/i18n/guest-list-form.es"
import { renderFormBodyMarkdown } from "@/lib/render-form-body-markdown"

describe("guest-list-form i18n", () => {
  it("loads intro markdown with Alicia Prime emphasis", async () => {
    expect(guestListFormEs.formIntroMarkdown).toMatch(
      /_\*\*Bienvenido al club Alicia Prime\*\*_/u,
    )
    const html = await renderFormBodyMarkdown(guestListFormEs.formIntroMarkdown)
    expect(html).toMatch(/<p>/u)
    expect(html).toMatch(/Alicia Prime/u)
  })
})