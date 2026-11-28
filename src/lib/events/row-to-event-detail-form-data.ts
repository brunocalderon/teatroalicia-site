import { airtableRowToEventEntryData } from "@/lib/airtable-cartelera/to-event-entry"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import { eventToSchemaFormData } from "@/lib/event-to-form"
import type { FormEntryData } from "@/lib/form-schema"

import { eventDetailPath } from "./event-detail-path"

/** Form-shaped data for event detail layout, JSON-LD, and ticket UTMs. */
export function rowToEventDetailFormData(
  row: AirtableCarteleraRow,
): FormEntryData {
  const path = eventDetailPath(row.eventId)
  const event = airtableRowToEventEntryData(row)
  const base = eventToSchemaFormData(event)

  const description = row.eventDescription?.trim()
  const messages = description
    ? {
        formBody: description,
        formBodyFormat: "html" as const,
      }
    : undefined

  return {
    ...base,
    path,
    thankYouPath: path,
    imageAlt: row.imageAlt ?? row.title,
    livestackFooter: false,
    messages,
  }
}