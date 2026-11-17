import { resolveAirtableBrowseConfig } from "@/lib/airtable-env"
import { fetchAirtableRecords } from "@/lib/fetch-airtable-records"
import {
  airtableRecordSchema,
  type AirtableRecordData,
} from "@/lib/airtable-record-schema"
import { mapAirtableBrowseRecord } from "@/lib/map-airtable-browse-record"
import {
  patchFieldsJsonWithLocalImage,
  resetAirtableAssetsDir,
  syncAirtableBrowseImageForRecord,
} from "@/lib/sync-airtable-browse-images"

/** Fetch and validate all browse rows (build / prerender). */
export async function loadAirtableBrowseRecords(): Promise<AirtableRecordData[]> {
  const config = resolveAirtableBrowseConfig()
  if (!config) {
    return []
  }

  const records = await fetchAirtableRecords({
    token: config.token,
    baseId: config.baseId,
    tableId: config.tableId,
    cellFormat: "string",
    timeZone: "America/Santiago",
    userLocale: "es-CL",
  })

  await resetAirtableAssetsDir()

  const seenSlugs = new Set<string>()
  const parsed: AirtableRecordData[] = []

  for (const { id: airtableRecordId, createdTime, fields } of records) {
    const mapped = mapAirtableBrowseRecord(
      airtableRecordId,
      createdTime,
      fields,
    )
    if (!mapped.ok) {
      continue
    }

    const { slug } = mapped.data
    if (seenSlugs.has(slug)) {
      throw new Error(
        `airtableRecords: duplicate slug "${slug}" in table "${config.tableId}".`,
      )
    }
    seenSlugs.add(slug)

    let recordData = mapped.data
    try {
      const synced = await syncAirtableBrowseImageForRecord(slug, fields)
      if (synced) {
        recordData = {
          ...recordData,
          imagePath: synced.imagePath,
          imageAlt: synced.imageAlt,
          fieldsJson: patchFieldsJsonWithLocalImage(
            recordData.fieldsJson,
            synced.imagePath,
          ),
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(
        `airtableRecords: failed to copy Image for slug "${slug}": ${message}`,
      )
    }

    parsed.push(airtableRecordSchema.parse(recordData))
  }

  return parsed.sort((a, b) => a.slug.localeCompare(b.slug, "es"))
}