import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"

import { formEntrySchema, formFieldTypeSchema } from "@/lib/form-schema"

const forms = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/forms" }),
  schema: formEntrySchema,
})

/** Allowed `fields[].type` values in `content/forms/*.md` (from `formFieldTypeSchema`). */
export const formFieldTypes = formFieldTypeSchema.options

export const collections = {
  forms,
}
