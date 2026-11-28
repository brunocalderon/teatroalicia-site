import { loadAirtableCarteleraRows } from "@/lib/airtable-cartelera/load-cartelera-rows"
import { filterUpcomingAirtableCarteleraRows } from "@/lib/airtable-cartelera/to-api-events"
import { formatEventSchedule } from "@/lib/format-event-display"
import { eventDetailPath } from "@/lib/events/event-detail-path"
import { resolveAirtableCarteleraConfig } from "@/lib/airtable-env"

export type HomeNavCarteleraItem = {
  title: string
  href: string
  dateLine: string
}

/** Upcoming cartelera events for the global header dropdown. */
export async function loadHomeNavCarteleraItems(): Promise<HomeNavCarteleraItem[]> {
  const config = resolveAirtableCarteleraConfig()
  if (!config) {
    return []
  }

  const rows = await loadAirtableCarteleraRows(config)
  return filterUpcomingAirtableCarteleraRows(rows).map((row) => {
    const schedule = formatEventSchedule(row.eventStart, row.eventEnd, {
      date: "home",
    })
    return {
      title: row.title,
      href: eventDetailPath(row.eventId),
      dateLine: schedule.dateLine,
    }
  })
}