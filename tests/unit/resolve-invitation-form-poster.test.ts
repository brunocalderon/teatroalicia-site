import { describe, expect, it } from "vitest"

import { invitationSlugFromPath } from "@/lib/invitation-bundled-poster"

describe("resolve-invitation-form-poster", () => {
  it("parses slug from invitation path", () => {
    expect(invitationSlugFromPath("/i/murano")).toBe("murano")
    expect(invitationSlugFromPath("/contacto")).toBeUndefined()
  })
})