import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"

import { airtablePagesLoader } from "@/lib/airtable-pages-loader"
import { airtableRecordsLoader } from "@/lib/airtable-records-loader"
import { airtableRecordSchema } from "@/lib/airtable-record-schema"
import { cmsPageSchema } from "@/lib/cms-page-schema"
import { eventEntrySchema } from "@/lib/event-schema"
import { formEntrySchema, formFieldTypeSchema } from "@/lib/form-schema"

const forms = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/forms" }),
  schema: formEntrySchema,
})

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/events" }),
  schema: eventEntrySchema,
})

const cmsPages = defineCollection({
  loader: airtablePagesLoader(),
  schema: cmsPageSchema,
})

const airtableRecords = defineCollection({
  loader: airtableRecordsLoader(),
  schema: airtableRecordSchema,
})

/** Allowed `fields[].type` values in form markdown (from `formFieldTypeSchema`). */
export const formFieldTypes = formFieldTypeSchema.options

export const collections = {
  forms,
  events,
  cmsPages,
  airtableRecords,
}
