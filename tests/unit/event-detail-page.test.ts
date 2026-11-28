import { describe, expect, it } from "vitest"

import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import { eventDetailPath } from "@/lib/events/event-detail-path"
import { rowToEventDetailFormData } from "@/lib/events/row-to-event-detail-form-data"
import { buildEventFromForm } from "@/lib/schema-org/build-event"

const sampleRow: AirtableCarteleraRow = {
  slug: "kissnshoot",
  title: "Kiss & Shoot: Masquerade",
  eventId: "kiss-and-shoot-2026-11-28",
  eventStart: "2026-11-28T22:00:00-03:00",
  guestListEnabled: false,
  airtableRecordId: "recXBM4A9FY89aiWO",
}

describe("event detail routes", () => {
  it("maps cartelera rows to /eventos/{eventId}", () => {
    expect(eventDetailPath(sampleRow.eventId)).toBe(
      "/eventos/kiss-and-shoot-2026-11-28",
    )
    const data = rowToEventDetailFormData(sampleRow)
    expect(data.path).toBe("/eventos/kiss-and-shoot-2026-11-28")
    const built = buildEventFromForm({ data })
    expect(built?.event.url).toBe(
      "https://teatroalicia.com/eventos/kiss-and-shoot-2026-11-28",
    )
  })
})