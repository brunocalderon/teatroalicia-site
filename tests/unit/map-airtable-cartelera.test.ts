import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  parseAirtableCarteleraListResponse,
} from "@/lib/airtable-cartelera/airtable-response-schema"
import { mapAirtableCarteleraRecord } from "@/lib/airtable-cartelera/map-record"
import { airtableRowToEventEntryData } from "@/lib/airtable-cartelera/to-event-entry"
import { eventToSchemaFormData } from "@/lib/event-to-form"
import { buildEventFromForm } from "@/lib/schema-org/build-event"
import {
  airtableCarteleraRowsToApiEvents,
  airtableRowToHomeEventFeature,
} from "@/lib/airtable-cartelera/to-api-events"

const carteleraListFixture = parseAirtableCarteleraListResponse(
  JSON.parse(
    readFileSync(
      new URL("../fixtures/airtable-cartelera-list-response.json", import.meta.url),
      "utf8",
    ),
  ),
)

describe("map-airtable-cartelera", () => {
  it("maps cartelera fields and builds home features", async () => {
    const fields = {
      Slug: "murano",
      Title: "Murano: One more night",
      eventId: "teatro-alicia-murano-2026-11-20",
      eventStart: "2026-11-20T21:00:00-03:00",
      eventEnd: "2026-11-21T02:00:00-03:00",
      ticketLink: "https://www.passline.com/eventos/murano",
      Image:
        "murano.jpg (https://v5.airtableusercontent.com/v3/example/murano.jpg)",
    }

    const mapped = mapAirtableCarteleraRecord("rec1", fields)
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) {
      throw new Error("expected ok")
    }

    const [event] = await airtableCarteleraRowsToApiEvents(
      [mapped.data],
      { now: new Date("2026-01-01") },
    )
    expect(event?.title).toBe("Murano: One more night")
    expect(event?.ctaExternal).toBe(true)
    expect(event?.ctaHref).toContain("utm_campaign=")
    expect(event?.image).toBeUndefined()
  })

  it("maps guest-pass Formgong metadata columns", () => {
    const mapped = mapAirtableCarteleraRecord("recGuestMeta", {
      Slug: "murano",
      "Event Name": "Murano",
      Title: "murano-2026-11-20",
      Start: "2026-11-20T21:00:00-03:00",
      "Ticket Supplier": "passline",
      "Supplier Event ID": "evt_123",
      "Guest Pass Ticket ID": "tkt_456",
    })
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) {
      throw new Error("expected ok")
    }
    expect(mapped.data.ticketSupplier).toBe("passline")
    expect(mapped.data.supplierEventId).toBe("evt_123")
    expect(mapped.data.guestPassTicketId).toBe("tkt_456")
  })

  it("maps Guest List and Guest List Fields", () => {
    const mapped = mapAirtableCarteleraRecord("recGuest", {
      Slug: "murano",
      "Event Name": "Murano",
      Title: "murano-2026-11-20",
      Start: "2026-11-20T21:00:00-03:00",
      "Guest List": "checked",
      "Guest List Fields": '[{"name":"email","label":"Email","type":"email","required":true}]',
    })
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) {
      throw new Error("expected ok")
    }
    expect(mapped.data.guestListEnabled).toBe(true)
    expect(mapped.data.guestListFieldsRaw).toContain("email")
  })

  it("maps production cartelera table fields (es_CL string dates)", async () => {
    const fields = {
      Slug: "ecdlv",
      "Event Name": "El Club de Los Viernes",
      Title: "el-club-de-los-viernes-2026-11-27",
      Start: "27 de noviembre de 2026 8:30pm",
      End: "28 de noviembre de 2026 4:30am",
      "Purchase Link": "https://www.passline.com/eventos/el-club-de-los-viernes",
      Image:
        "elclubdelosviernes.jpg (https://v5.airtableusercontent.com/v3/example/elclub.jpg)",
    }

    const mapped = mapAirtableCarteleraRecord("reca8x", fields)
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) {
      throw new Error("expected ok")
    }
    expect(mapped.data.title).toBe("El Club de Los Viernes")
    expect(mapped.data.eventId).toBe("el-club-de-los-viernes-2026-11-27")
    expect(mapped.data.eventStart).toBe("2026-11-27T20:30:00-03:00")

    const fieldsWithSupplier = {
      ...fields,
      "Ticket Supplier": "passline",
    }
    const mappedWithSupplier = mapAirtableCarteleraRecord(
      "reca8x",
      fieldsWithSupplier,
    )
    expect(mappedWithSupplier.ok).toBe(true)
    if (!mappedWithSupplier.ok) {
      throw new Error("expected ok")
    }
    expect(mappedWithSupplier.data.ticketSupplier).toBe("passline")

    const [event] = await airtableCarteleraRowsToApiEvents(
      [mappedWithSupplier.data],
      { now: new Date("2026-11-21T12:00:00-03:00") },
    )
    expect(event?.title).toBe("El Club de Los Viernes")
    expect(event?.ctaHref).toContain("passline.com")
    expect(event?.ticketSupplier).toBe("passline")
    expect(event?.eventId).toBe("el-club-de-los-viernes-2026-11-27")
    expect(event?.eventCampaign).toBe("el-club-de-los-viernes")
    expect(event?.ticketContentId).toBe("ecdlv-2026-11-27")
  })

  it("parses list API response and maps both cartelera records", async () => {
    const rows = carteleraListFixture.records.flatMap((record) => {
      const mapped = mapAirtableCarteleraRecord(
        record.id,
        record.fields,
        record.createdTime,
      )
      return mapped.ok ? [mapped.data] : []
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]?.eventKind).toBe("social-music")
    expect(rows[0]?.airtableRecordId).toBe("recZTR2et7aeEZfXu")
    expect(rows[0]?.imageAlt).toBe("Murano: One More Night")
    expect(rows[0]?.imageUrl).toMatch(/^https:\/\/v5\.airtableusercontent\.com\//)
    expect(rows[0]?.imageUrl).not.toMatch(/\.jpg\s+\(/)
    expect(rows[0]?.ticketSupplier).toBe("passline")
    expect(rows[0]?.guestListEnabled).toBe(false)

    const apiEvents = await airtableCarteleraRowsToApiEvents(rows, {
      now: new Date("2026-11-21T12:00:00-03:00"),
    })
    expect(apiEvents.map((event) => event.title)).toEqual([
      "El Club de Los Viernes",
    ])

    const ecdlv = rows.find((row) => row.slug === "ecdlv")
    expect(ecdlv).toBeDefined()
    const eventData = airtableRowToEventEntryData(ecdlv!)
    expect(eventData.lang).toBe("es")
    expect(eventData.eventKind).toBe("social-music")
    const built = buildEventFromForm({
      data: eventToSchemaFormData(eventData),
    })
    expect(built?.event["@type"]).toEqual(["SocialEvent", "MusicEvent"])
  })

  it("exposes detailHref when Event Description is set", () => {
    const mapped = mapAirtableCarteleraRecord("recDetail", {
      Slug: "murano",
      "Event Name": "Murano",
      Title: "murano-2026-11-20",
      Start: "2026-11-20T21:00:00-03:00",
      "Event Description": "<p>Hola</p>",
    })
    expect(mapped.ok).toBe(true)
    if (!mapped.ok) {
      throw new Error("expected ok")
    }
  const feature = airtableRowToHomeEventFeature(mapped.data)
    expect(feature.detailHref).toBe("/eventos/murano-2026-11-20")
  })
})