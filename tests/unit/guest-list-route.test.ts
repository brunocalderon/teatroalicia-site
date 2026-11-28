import { describe, expect, it } from "vitest"

import {
  airtableRowHasGuestListRoute,
  airtableRowHasGuestPassConfig,
  resolveGuestListRouteKind,
} from "@/lib/airtable-cartelera/guest-list-route"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

const configuredFields =
  '[{"name":"email","type":"email","label":"Email","required":true}]'

const fullConfig: Pick<
  AirtableCarteleraRow,
  "supplierEventId" | "guestListFieldsRaw" | "guestPassTicketId"
> = {
  supplierEventId: "evt_abc",
  guestListFieldsRaw: configuredFields,
  guestPassTicketId: "tkt_xyz",
}

const baseRow: AirtableCarteleraRow = {
  slug: "sample",
  title: "Sample",
  eventId: "sample-2026",
  eventStart: "2026-12-01T20:00:00-03:00",
  guestListEnabled: false,
  airtableRecordId: "recSample",
}

describe("airtableRowHasGuestPassConfig", () => {
  it("requires supplier event id, fields JSON, and guest pass ticket id", () => {
    expect(
      airtableRowHasGuestPassConfig({ ...baseRow, ...fullConfig }),
    ).toBe(true)
    expect(
      airtableRowHasGuestPassConfig({
        ...baseRow,
        ...fullConfig,
        supplierEventId: "",
      }),
    ).toBe(false)
    expect(
      airtableRowHasGuestPassConfig({
        ...baseRow,
        ...fullConfig,
        guestListFieldsRaw: "  ",
      }),
    ).toBe(false)
    expect(
      airtableRowHasGuestPassConfig({
        ...baseRow,
        ...fullConfig,
        guestPassTicketId: undefined,
      }),
    ).toBe(false)
  })
})

describe("resolveGuestListRouteKind", () => {
  it("returns invite when Guest List is on and config is complete", () => {
    expect(
      resolveGuestListRouteKind({
        ...baseRow,
        ...fullConfig,
        guestListEnabled: true,
      }),
    ).toBe("invite")
  })

  it("returns redirect when Guest List is off and config is complete", () => {
    expect(
      resolveGuestListRouteKind({ ...baseRow, ...fullConfig }),
    ).toBe("redirect")
  })

  it("returns none when all three config fields are empty", () => {
    expect(resolveGuestListRouteKind(baseRow)).toBe("none")
  })

  it("returns none for Guest List on without full config", () => {
    expect(
      resolveGuestListRouteKind({
        ...baseRow,
        guestListEnabled: true,
        guestListFieldsRaw: configuredFields,
      }),
    ).toBe("none")
  })

  it("returns none for partial config when Guest List is off", () => {
    expect(
      resolveGuestListRouteKind({
        ...baseRow,
        guestListFieldsRaw: configuredFields,
      }),
    ).toBe("none")
  })
})

describe("airtableRowHasGuestListRoute", () => {
  it("is true for invite and redirect kinds", () => {
    expect(
      airtableRowHasGuestListRoute({
        ...baseRow,
        ...fullConfig,
        guestListEnabled: true,
      }),
    ).toBe(true)
    expect(airtableRowHasGuestListRoute({ ...baseRow, ...fullConfig })).toBe(
      true,
    )
  })

  it("is false for none", () => {
    expect(airtableRowHasGuestListRoute(baseRow)).toBe(false)
  })
})