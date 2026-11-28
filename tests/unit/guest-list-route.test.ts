import { describe, expect, it } from "vitest"

import { airtableRowHasGuestListRoute } from "@/lib/airtable-cartelera/guest-list-route"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

const baseRow: AirtableCarteleraRow = {
  slug: "sample",
  title: "Sample",
  eventId: "sample-2026",
  eventStart: "2026-12-01T20:00:00-03:00",
  guestListEnabled: false,
  airtableRecordId: "recSample",
}

describe("airtableRowHasGuestListRoute", () => {
  it("includes rows when Guest List is enabled", () => {
    expect(
      airtableRowHasGuestListRoute({ ...baseRow, guestListEnabled: true }),
    ).toBe(true)
  })

  it("includes rows with configured fields when Guest List is off", () => {
    expect(
      airtableRowHasGuestListRoute({
        ...baseRow,
        guestListFieldsRaw: '[{"name":"email","type":"email","label":"Email"}]',
      }),
    ).toBe(true)
  })

  it("excludes rows with no guest list configuration", () => {
    expect(airtableRowHasGuestListRoute(baseRow)).toBe(false)
  })
})