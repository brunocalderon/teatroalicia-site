import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { mapAirtablePromoterRecord } from "@/lib/airtable-promoters/map-record"

const fixture = JSON.parse(
  readFileSync(
    new URL("../fixtures/airtable-promoters-list-response.json", import.meta.url),
    "utf8",
  ),
) as {
  records: Array<{ id: string; fields: Record<string, unknown> }>
}

describe("mapAirtablePromoterRecord", () => {
  it("maps checked checkbox fields and defaults missing flags to false", () => {
    const guestPass = mapAirtablePromoterRecord(
      fixture.records[0]!.id,
      fixture.records[0]!.fields,
    )
    expect(guestPass).toEqual({
      ok: true,
      data: {
        id: "trini-alvarado",
        name: "Trini Alvarado",
        active: true,
        ticket_sale_enabled: true,
        guest_pass_enabled: true,
      },
    })

    const inactive = mapAirtablePromoterRecord(
      fixture.records[1]!.id,
      fixture.records[1]!.fields,
    )
    expect(inactive).toEqual({
      ok: true,
      data: {
        id: "marcela-abusleme",
        name: "Marcela Abusleme",
        active: false,
        ticket_sale_enabled: true,
        guest_pass_enabled: false,
      },
    })
  })
})