import { airtableCarteleraRecordSchema } from "@/lib/airtable-cartelera/airtable-response-schema"
import { mapAirtableCarteleraRecord } from "@/lib/airtable-cartelera/map-record"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import { fetchAirtableRecords } from "@/lib/fetch-airtable-records"

export type FetchAirtableCarteleraConfig = {
  token: string
  baseId: string
  tableId: string
  viewId?: string
}

export async function fetchAirtableCarteleraRows(
  config: FetchAirtableCarteleraConfig,
): Promise<AirtableCarteleraRow[]> {
  const records = await fetchAirtableRecords({
    token: config.token,
    baseId: config.baseId,
    tableId: config.tableId,
    cellFormat: "string",
    timeZone: "America/Santiago",
    userLocale: "es_CL",
    view: config.viewId,
  })

  const rows: AirtableCarteleraRow[] = []

  for (const record of records) {
    const parsed = airtableCarteleraRecordSchema.safeParse(record)
    if (!parsed.success) {
      continue
    }

    const mapped = mapAirtableCarteleraRecord(
      parsed.data.id,
      parsed.data.fields,
      parsed.data.createdTime,
    )
    if (!mapped.ok) {
      continue
    }
    rows.push(mapped.data)
  }

  return rows
}