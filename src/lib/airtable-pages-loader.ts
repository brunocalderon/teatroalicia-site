import type { Loader } from "astro/loaders"
import Airtable from "airtable"

import { resolveAirtableCmsConfig } from "@/lib/airtable-env"
import { mapAirtableCmsPageFields } from "@/lib/map-airtable-cms-page"

export function airtablePagesLoader(): Loader {
  return {
    name: "airtable-pages-loader",
    load: async ({ logger, parseData, renderMarkdown, store }) => {
      const config = resolveAirtableCmsConfig()
      if (!config) {
        logger.warn(
          "cmsPages: set AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_CMS_TABLE_ID to enable /info/ pages.",
        )
        return
      }

      const { token, baseId, tableId } = config
      const base = new Airtable({ apiKey: token }).base(baseId)

      logger.info(`cmsPages: loading rows from "${tableId}"`)

      let records: Awaited<ReturnType<ReturnType<typeof base>["select"]>["all"]>
      try {
        records = await base(tableId).select().all()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error)
        logger.error(`cmsPages: Airtable request failed: ${message}`)
        throw error
      }

      const seenSlugs = new Set<string>()
      let stored = 0

      for (const { id: recordId, fields } of records) {
        const mapped = mapAirtableCmsPageFields(recordId, fields)
        if (!mapped.ok) {
          logger.warn(
            `cmsPages: skipping record ${recordId}: ${mapped.message}`,
          )
          continue
        }

        const { slug } = mapped.data
        if (seenSlugs.has(slug)) {
          throw new Error(
            `cmsPages: duplicate slug "${slug}" in Airtable table "${tableId}".`,
          )
        }
        seenSlugs.add(slug)

        let data: Awaited<ReturnType<typeof parseData>>["data"]
        try {
          const parsed = await parseData({
            id: slug,
            data: mapped.data,
          })
          data = parsed.data
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error)
          logger.warn(
            `cmsPages: skipping record ${recordId} (slug ${slug}): ${message}`,
          )
          continue
        }

        const body = mapped.data.body.trim()
        const rendered = body.length > 0 ? await renderMarkdown(body) : undefined

        store.set({
          id: slug,
          data,
          ...(rendered ? { rendered } : {}),
        })
        stored += 1
      }

      logger.info(
        `cmsPages: stored ${stored} of ${records.length} record(s).`,
      )
    },
  }
}