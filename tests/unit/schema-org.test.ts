import { describe, expect, it } from "vitest"

import { venueConfig } from "../../content/venue"
import { buildEventFromForm } from "@/lib/schema-org/build-event"
import { buildHomePageJsonLd } from "@/lib/schema-org/build-home-json-ld"
import { buildInvitationPageJsonLd } from "@/lib/schema-org/build-invitation-page-json-ld"
import { buildUpcomingEventsItemList } from "@/lib/schema-org/build-item-list"
import { buildVenueNode } from "@/lib/schema-org/build-venue"
import { CANONICAL_SITE_ORIGIN } from "@/lib/schema-org/canonical-origin"
import {
  eventEntityId,
  HOME_WEBPAGE_ENTITY_ID,
  UPCOMING_EVENTS_LIST_ID,
  VENUE_ENTITY_ID,
  WEBSITE_ENTITY_ID,
} from "@/lib/schema-org/ids"
import {
  isoOffsetMatchesSantiago,
  isUpcomingEventStart,
} from "@/lib/schema-org/event-datetime"
import { serializeJsonLd } from "@/lib/schema-org/serialize-json-ld"
import type { FormEntryData } from "@/lib/form-schema"

const muranoFormData = {
  title: "Murano: One more night",
  description:
    "Solicita tickets de cortesía para Murano — One More Night en Teatro Alicia.",
  path: "/i/murano",
  eventId: "teatro-alicia-murano-one-more-night-2026-11-20",
  eventKind: "social-music",
  eventStart: "2026-11-20T21:00:00-03:00",
  eventEnd: "2026-11-21T02:00:00-03:00",
  invitationOnly: true,
  token: "fk_test",
  lang: "es",
  submitLabel: "Enviar",
  thankYouPath: "/i/murano/gracias",
  organizerIsVenue: false,
  fields: [{ name: "email", label: "Email", type: "email" as const }],
} satisfies FormEntryData

describe("schema.org JSON-LD", () => {
  it("uses canonical teatroalicia.com entity ids", () => {
    expect(VENUE_ENTITY_ID).toBe(
      `${CANONICAL_SITE_ORIGIN}/#teatro-alicia`,
    )
    expect(WEBSITE_ENTITY_ID).toBe(`${CANONICAL_SITE_ORIGIN}/#website`)
    expect(HOME_WEBPAGE_ENTITY_ID).toBe(
      `${CANONICAL_SITE_ORIGIN}/#webpage`,
    )
    expect(UPCOMING_EVENTS_LIST_ID).toBe(
      `${CANONICAL_SITE_ORIGIN}/#upcoming-events`,
    )
  })

  it("builds venue without self-serving or unsupported properties", () => {
    const venue = buildVenueNode(venueConfig)
    expect(venue["@id"]).toBe(VENUE_ENTITY_ID)
    expect(venue.url).toBe("https://teatroalicia.com/")
    expect(venue.email).toBe("contacto@teatroalicia.cl")
    expect(venue.keywords).toEqual(venueConfig.keywords)
    expect(venue).not.toHaveProperty("inLanguage")
    expect(venue).not.toHaveProperty("aggregateRating")
    expect(venue).not.toHaveProperty("makesOffer")
    expect(venue.sameAs).toEqual(
      expect.arrayContaining([
        venueConfig.googleMapsUrl,
        "https://www.instagram.com/teatroalicia.scl/",
      ]),
    )
    expect(venue.sameAs).not.toContain("https://teatroalicia.cl/")
    expect(venue.sameAs).not.toContain("https://teatroalicia.com/")
  })

  it("classifies events by eventKind without redundant Event type", () => {
    const built = buildEventFromForm({ data: muranoFormData })
    expect(built?.event["@type"]).toEqual(["SocialEvent", "MusicEvent"])
    expect(built?.event["@id"]).toBe(
      eventEntityId(muranoFormData.eventId!),
    )
    expect(built?.event).not.toHaveProperty("organizer")
    expect(built?.event).not.toHaveProperty("performer")
    expect(built?.event).not.toHaveProperty("isAccessibleForFree")
  })

  it("represents guest pass as application offer, not free admission", () => {
    const built = buildEventFromForm({ data: muranoFormData })
    const offers = built?.event.offers as Record<string, unknown>[]
    expect(offers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://teatroalicia.com/i/murano",
          availability: "https://schema.org/LimitedAvailability",
        }),
      ]),
    )
  })

  it("omits event entity when eventId is missing", () => {
    const missingId = buildEventFromForm({
      data: { ...muranoFormData, eventId: undefined },
    })
    expect(missingId).toBeUndefined()
  })

  it("builds homepage graph without embedding event nodes", () => {
    const graph = buildHomePageJsonLd({
      venue: venueConfig,
      pageTitle: "Teatro Alicia",
    })
    const nodes = graph["@graph"] as Record<string, unknown>[]
    expect(nodes).toHaveLength(3)
    expect(nodes.some((n) => n["@type"] === "WebSite")).toBe(true)
    expect(nodes.some((n) => n["@id"] === HOME_WEBPAGE_ENTITY_ID)).toBe(true)
    expect(
      nodes.some((n) => n["@type"] === "ItemList"),
    ).toBe(false)
  })

  it("builds invitation page graph with webpage mainEntity event and venue", () => {
    const graph = buildInvitationPageJsonLd({
      venue: venueConfig,
      data: muranoFormData,
      pageTitle: muranoFormData.title,
    })
    expect(graph).toBeDefined()
    const nodes = graph!["@graph"] as Record<string, unknown>[]
    const webpage = nodes.find((n) => n["@type"] === "WebPage")
    expect(webpage?.mainEntity).toEqual({
      "@id": eventEntityId(muranoFormData.eventId!),
    })
    expect(nodes.some((n) => n["@id"] === VENUE_ENTITY_ID)).toBe(true)
  })

  it("filters past events from upcoming item list", () => {
    const past = new Date("2027-01-01T12:00:00-03:00")
    const list = buildUpcomingEventsItemList(
      [{ id: "murano", data: muranoFormData }],
      past,
    )
    expect(list).toBeUndefined()
    expect(isUpcomingEventStart(muranoFormData.eventStart!, past)).toBe(false)
  })

  it("validates Santiago offsets on sample event ISO dates", () => {
    expect(isoOffsetMatchesSantiago("2026-11-20T21:00:00-03:00")).toBe(true)
    expect(isoOffsetMatchesSantiago("2026-06-15T21:00:00-04:00")).toBe(true)
  })

  it("serializes JSON-LD without undefined keys", () => {
    const payload = buildVenueNode(venueConfig)
    const json = serializeJsonLd(payload)
    expect(json).not.toContain("undefined")
    expect(() => JSON.parse(json)).not.toThrow()
  })
})