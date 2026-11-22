import { resolveAirtableCarteleraEventKind } from "@/lib/airtable-cartelera/resolve-event-kind"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import type { EventEntryData } from "@/lib/event-schema"

export function airtableRowToEventEntryData(
  row: AirtableCarteleraRow,
): EventEntryData {
  return {
    slug: row.slug,
    title: row.title,
    description: row.title,
    lang: row.language?.trim() || "es",
    eventId: row.eventId,
    eventStart: row.eventStart,
    eventEnd: row.eventEnd,
    eventKind: resolveAirtableCarteleraEventKind(row.eventKind),
    ticketUrl: row.ticketUrl,
    ticketLink: row.ticketUrl,
    imageAlt: row.imageAlt,
  }
}