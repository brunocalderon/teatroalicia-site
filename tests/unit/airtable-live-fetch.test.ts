import { afterEach, describe, expect, it, vi } from "vitest"

import { assertAirtableApiCallAllowed } from "@/lib/airtable-live-fetch"

describe("assertAirtableApiCallAllowed", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.AIRTABLE_LIVE_FETCH
  })

  it("rejects calls in the browser", () => {
    vi.stubGlobal("window", {})
    expect(() => assertAirtableApiCallAllowed()).toThrow(/browser/i)
  })

  it("allows explicit live fetch flag", () => {
    process.env.AIRTABLE_LIVE_FETCH = "1"
    expect(() => assertAirtableApiCallAllowed()).not.toThrow()
  })
})