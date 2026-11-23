import { mapAirtablePromoterRecord } from "./map-record.ts"
import { fetchAirtableRecords } from "../fetch-airtable-records.ts"
import type { PromoterRosterEntry } from "../promoters-roster-types.ts"

export type FetchAirtablePromotersConfig = {
  token: string
  baseId: string
  tableId: string
  viewId?: string
}

export async function fetchAirtablePromotersRows(
  config: FetchAirtablePromotersConfig,
): Promise<PromoterRosterEntry[]> {
  const records = await fetchAirtableRecords({
    token: config.token,
    baseId: config.baseId,
    tableId: config.tableId,
    cellFormat: "string",
    timeZone: "America/Santiago",
    userLocale: "es_CL",
    view: config.viewId,
  })

  const rows: PromoterRosterEntry[] = []

  for (const record of records) {
    const mapped = mapAirtablePromoterRecord(record.id, record.fields)
    if (!mapped.ok) {
      continue
    }
    rows.push(mapped.data)
  }

  return rows
}