import { describe, expect, it } from "vitest"

import { airtableRowToInvitationFormData } from "@/lib/airtable-cartelera/to-invitation-form"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

const sampleRow: AirtableCarteleraRow = {
  slug: "murano",
  title: "Murano: One More Night",
  eventId: "murano-one-more-night-2026-11-20",
  eventStart: "2026-11-20T20:30:00-03:00",
  ticketSupplier: "passline",
  supplierEventId: "evt_abc",
  guestPassTicketId: "tkt_xyz",
  guestListEnabled: true,
  airtableRecordId: "recTest",
}

describe("airtableRowToInvitationFormData", () => {
  it("maps slug to /i/:slug with empty fields", () => {
    const data = airtableRowToInvitationFormData(sampleRow, {
      formToken: "fk_test_token",
    })
    expect(data.path).toBe("/i/murano")
    expect(data.thankYouPath).toBe("/i/murano/gracias")
    expect(data.fields).toEqual([])
    expect(data.lang).toBe("es")
    expect(data.submitLabel).toBe("Solicitar mi acceso")
    expect(data.token).toBe("fk_test_token")
    expect(data.messages?.formBody).toContain("Alicia Prime")
    expect(data.invitationOnly).toBe(true)
    expect(data.ticketSupplier).toBe("passline")
    expect(data.supplierEventId).toBe("evt_abc")
    expect(data.guestPassTicketId).toBe("tkt_xyz")
  })

  it("uses Event Description as HTML for form intro when set", () => {
    const html = "<h3>Solo para este show</h3><p>Texto del evento.</p>"
    const data = airtableRowToInvitationFormData(
      {
        ...sampleRow,
        eventDescription: html,
      },
      { formToken: "fk_test_token" },
    )
    expect(data.messages?.formBody).toBe(html)
    expect(data.messages?.formBodyFormat).toBe("html")
    expect(data.messages?.formBody).not.toContain("Alicia Prime")
  })

  it("uses env token for every guest-list form", () => {
    const data = airtableRowToInvitationFormData(sampleRow, {
      formToken: "fk_from_env",
    })
    expect(data.token).toBe("fk_from_env")
  })

  it("marks guest list closed when Guest List is off", () => {
    const data = airtableRowToInvitationFormData(
      { ...sampleRow, guestListEnabled: false },
      { formToken: "fk_test" },
    )
    expect(data.guestListClosed).toBe(true)
  })

  it("keeps guest list open when Guest List is on", () => {
    const data = airtableRowToInvitationFormData(sampleRow, {
      formToken: "fk_test",
    })
    expect(data.guestListClosed).toBe(false)
  })
})