import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { buildLlmsTxt } from "@/lib/llms-txt"
import { loadAirtableBrowseRecords } from "@/lib/load-airtable-browse-records"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const cmsEntries = await getCollection("cmsPages")
  const cmsPages = cmsEntries.map((entry) => ({
    path: entry.data.path,
    title: entry.data.title,
  }))
  const airtableRecords = await loadAirtableBrowseRecords()
  const extraPages = [
    ...cmsPages,
    ...airtableRecords.map((record) => ({
      path: `/airtable/${record.slug}`,
      title: record.slug,
    })),
  ]
  const body = buildLlmsTxt(resolveSiteOrigin(), extraPages)

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}