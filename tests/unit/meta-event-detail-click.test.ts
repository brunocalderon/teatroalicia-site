import { describe, expect, it } from "vitest"

import { resolveEventDetailClickDestination } from "@/lib/meta-event-detail-click"

describe("meta-event-detail-click", () => {
  it("resolves pathname from relative href", () => {
    expect(resolveEventDetailClickDestination("/eventos/kiss-and-shoot-2026-11-28")).toBe(
      "/eventos/kiss-and-shoot-2026-11-28",
    )
  })

  it("resolves pathname from absolute href", () => {
    expect(
      resolveEventDetailClickDestination(
        "https://teatroalicia.com/eventos/show-2026-01-01",
      ),
    ).toBe("/eventos/show-2026-01-01")
  })
})