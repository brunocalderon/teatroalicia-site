import type { EventEntryData } from "@/lib/event-schema"
import type { FormEntryData } from "@/lib/form-schema"
import { getUpcomingEventEntriesForSchema } from "@/lib/home-upcoming-events"
import { isCarteleraEventVisible } from "@/lib/schema-org/event-datetime"

import { eventEntityId } from "./ids"
import type { JsonLdObject } from "./json-ld-types"
import { UPCOMING_EVENTS_LIST_ID } from "./ids"

export type FormEntryForSchema = {
  id: string
  data: FormEntryData
}

export type EventEntryForSchema = {
  id: string
  data: EventEntryData
}

/** Legacy: invitation/form markdown shaped as `FormEntryData` (unit tests). */
export function buildUpcomingEventsItemList(
  forms: FormEntryForSchema[],
  now: Date = new Date(),
): JsonLdObject | undefined {
  const upcoming = forms
    .filter((entry) => entry.data.eventStart?.trim() && entry.data.eventId?.trim())
    .filter((entry) =>
      isCarteleraEventVisible(
        entry.data.eventStart!,
        entry.data.eventEnd,
        now,
      ),
    )
    .sort((a, b) => {
      const aTime = new Date(a.data.eventStart!).getTime()
      const bTime = new Date(b.data.eventStart!).getTime()
      return aTime - bTime
    })

  return buildItemListBody(
    upcoming.map((entry) => entry.data.eventId!),
  )
}

export function buildUpcomingEventsItemListFromEvents(
  events: EventEntryForSchema[],
  now: Date = new Date(),
): JsonLdObject | undefined {
  const upcoming = getUpcomingEventEntriesForSchema(events, now)
  return buildItemListBody(upcoming.map((entry) => entry.data.eventId))
}

function buildItemListBody(eventIds: string[]): JsonLdObject | undefined {
  if (eventIds.length === 0) {
    return undefined
  }

  return {
    "@type": "ItemList",
    "@id": UPCOMING_EVENTS_LIST_ID,
    name: "Próximos eventos en Teatro Alicia",
    numberOfItems: eventIds.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: eventIds.map((eventId, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": eventEntityId(eventId),
      },
    })),
  }
}