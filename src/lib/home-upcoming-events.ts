import type { CollectionEntry } from "astro:content"

import { isCarteleraEventVisible } from "@/lib/schema-org/event-datetime"

export type EventEntry = CollectionEntry<"events">

/** Events with `eventId` + `eventStart`, ascending by start time. */
export function getUpcomingEventEntries(
  events: EventEntry[],
  now: Date = new Date(),
): EventEntry[] {
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

export type EventEntryForListing = {
  id: string
  data: EventEntry["data"]
}

/** Same ordering as `getUpcomingEventEntries` for JSON-LD builders. */
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