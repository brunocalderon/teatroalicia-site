import type { Loader } from "astro/loaders"

import { loadAirtableBrowseRecords } from "@/lib/load-airtable-browse-records"
import { resolveAirtableBrowseConfig } from "@/lib/airtable-env"

export function airtableRecordsLoader(): Loader {
  return {
    name: "airtable-records-loader",
    load: async ({ logger, parseData, store }) => {
      if (!resolveAirtableBrowseConfig()) {
        logger.warn(
          "airtableRecords: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, or AIRTABLE_TABLE_ID not set; skipping fetch.",
        )
        return
      }

      const records = await loadAirtableBrowseRecords()
      logger.info(`airtableRecords: syncing ${records.length} record(s) to content store`)

      for (const record of records) {
        const parsed = await parseData({
          id: record.slug,
          data: record,
        })
        store.set({ id: record.slug, data: parsed.data })
      }
    },
  }
}