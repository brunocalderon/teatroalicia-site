import type { FormEntryData } from "@/lib/form-schema"

import { isUpcomingEventStart } from "./event-datetime"
import { eventEntityId } from "./ids"
import type { JsonLdObject } from "./json-ld-types"
import { UPCOMING_EVENTS_LIST_ID } from "./ids"

export type FormEntryForSchema = {
  id: string
  data: FormEntryData
}

export function buildUpcomingEventsItemList(
  forms: FormEntryForSchema[],
  now: Date = new Date(),
): JsonLdObject | undefined {
  const upcoming = forms
    .filter((entry) => entry.data.eventStart && entry.data.eventId)
    .filter((entry) => isUpcomingEventStart(entry.data.eventStart!, now))
    .sort((a, b) => {
      const aTime = new Date(a.data.eventStart!).getTime()
      const bTime = new Date(b.data.eventStart!).getTime()
      return aTime - bTime
    })

  if (upcoming.length === 0) {
    return undefined
  }

  return {
    "@type": "ItemList",
    "@id": UPCOMING_EVENTS_LIST_ID,
    name: "Próximos eventos en Teatro Alicia",
    numberOfItems: upcoming.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: upcoming.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": eventEntityId(entry.data.eventId!),
      },
    })),
  }
}