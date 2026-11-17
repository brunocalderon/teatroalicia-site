export type AirtableApiRecord = {
  id: string
  createdTime?: string
  fields: Record<string, unknown>
}

type AirtableListResponse = {
  records: AirtableApiRecord[]
  offset?: string
}

export type FetchAirtableRecordsOptions = {
  token: string
  baseId: string
  tableId: string
  cellFormat?: "string" | "json"
  timeZone?: string
  userLocale?: string
}

/** List all records (paginated), matching the public REST list-records API. */
export async function fetchAirtableRecords(
  options: FetchAirtableRecordsOptions,
): Promise<AirtableApiRecord[]> {
  const records: AirtableApiRecord[] = []
  const search = new URLSearchParams()

  if (options.cellFormat) {
    search.set("cellFormat", options.cellFormat)
  }
  if (options.timeZone) {
    search.set("timeZone", options.timeZone)
  }
  if (options.userLocale) {
    search.set("userLocale", options.userLocale)
  }

  let offset: string | undefined

  do {
    const query = new URLSearchParams(search)
    if (offset) {
      query.set("offset", offset)
    }

    const url = `https://api.airtable.com/v0/${encodeURIComponent(options.baseId)}/${encodeURIComponent(options.tableId)}?${query.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Airtable HTTP ${response.status}: ${text.slice(0, 240)}`,
      )
    }

    const page = (await response.json()) as AirtableListResponse
    records.push(...page.records)
    offset = page.offset
  } while (offset)

  return records
}