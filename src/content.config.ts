import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"

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

/** Allowed `fields[].type` values in form markdown (from `formFieldTypeSchema`). */
export const formFieldTypes = formFieldTypeSchema.options

export const collections = {
  forms,
  events,
}
