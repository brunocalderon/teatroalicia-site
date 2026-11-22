import type { FormEntryData, FormEventStatus } from "@/lib/form-schema"

import { buildEventOffers } from "./build-offers"
import {
  buildOrganizerNodes,
  organizerReferences,
} from "./build-organizer"
import {
  buildPerformerNodes,
  performerReferences,
} from "./build-performers"
import { canonicalPageUrl } from "./canonical-origin"
import { resolveEventSchemaTypes } from "./event-types"
import { eventEntityId, VENUE_ENTITY_ID } from "./ids"
import type { JsonLdObject } from "./json-ld-types"

const EVENT_STATUS_URL: Record<FormEventStatus, string> = {
  EventScheduled: "https://schema.org/EventScheduled",
  EventCancelled: "https://schema.org/EventCancelled",
  EventPostponed: "https://schema.org/EventPostponed",
  EventRescheduled: "https://schema.org/EventRescheduled",
}

const EVENT_ATTENDANCE_URL = {
  OfflineEventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  OnlineEventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  MixedEventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
} as const

export type BuildEventInput = {
  data: FormEntryData
  imageUrl?: string
}

export type BuildEventResult = {
  event: JsonLdObject
  organizers: JsonLdObject[]
  performers: JsonLdObject[]
}

export function buildEventFromForm(
  input: BuildEventInput,
): BuildEventResult | undefined {
  const { data, imageUrl } = input
  if (!data.eventStart) {
    return undefined
  }
  if (!data.eventId) {
    return undefined
  }

  const entityId = eventEntityId(data.eventId)
  const eventPageUrl = canonicalPageUrl(data.path)

  const organizerNodes = buildOrganizerNodes(data, entityId)
  const performerNodes = buildPerformerNodes(data.performer, entityId)

  const event: JsonLdObject = {
    "@type": resolveEventSchemaTypes(data.eventKind ?? "general"),
    "@id": entityId,
    name: data.title,
    description: data.description ?? data.title,
    url: eventPageUrl,
    startDate: data.eventStart,
    eventStatus: data.eventStatus
      ? EVENT_STATUS_URL[data.eventStatus]
      : EVENT_STATUS_URL.EventScheduled,
    eventAttendanceMode: data.eventAttendanceMode
      ? EVENT_ATTENDANCE_URL[data.eventAttendanceMode]
      : EVENT_ATTENDANCE_URL.OfflineEventAttendanceMode,
    inLanguage: data.lang === "es" ? "es-CL" : data.lang,
    location: { "@id": VENUE_ENTITY_ID },
    identifier: data.eventId,
  }

  if (data.eventEnd) {
    event.endDate = data.eventEnd
  }
  if (imageUrl) {
    event.image = imageUrl
  }
  if (organizerNodes.length > 0) {
    event.organizer = organizerReferences(organizerNodes)
  }
  if (performerNodes.length > 0) {
    event.performer = performerReferences(performerNodes)
  }

  const offers = buildEventOffers(data)
  if (offers.length > 0) {
    event.offers = offers
  }

  if (data.isAccessibleForFree === true) {
    event.isAccessibleForFree = true
  }
  if (data.typicalAgeRange) {
    event.typicalAgeRange = data.typicalAgeRange
  }
  if (data.eventMaximumAttendeeCapacity) {
    event.maximumAttendeeCapacity = data.eventMaximumAttendeeCapacity
  }

  return {
    event,
    organizers: organizerNodes,
    performers: performerNodes,
  }
}