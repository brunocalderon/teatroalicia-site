import type { EventEntryData } from "@/lib/event-schema"
import { isCarteleraEventVisible } from "@/lib/schema-org/event-datetime"

export type EventEntryForListing = {
  id: string
  data: EventEntryData
}

/** Upcoming events for JSON-LD (Airtable snapshot shape). */
export function getUpcomingEventEntriesForSchema(
  events: EventEntryForListing[],
  now: Date = new Date(),
): EventEntryForListing[] {
  return events
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
}