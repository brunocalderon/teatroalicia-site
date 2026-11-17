import { z } from "astro/zod"

const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase letters, numbers, and hyphens",
  )

/** One row from the browse table (`airtableRecords` → `/airtable/:slug`). */
export const airtableRecordSchema = z.object({
  slug: slugSchema,
  airtableRecordId: z.string().min(1),
  createdTime: z.string().optional(),
  /** Stringified Airtable `fields` object (content store–safe). */
  fieldsJson: z.string(),
  /** First `Image` attachment, copied to `public/airtable-assets/` at sync. */
  imagePath: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional(),
})

export type AirtableRecordData = z.infer<typeof airtableRecordSchema>

export function parseAirtableRecordFields(
  data: Pick<AirtableRecordData, "fieldsJson">,
): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(data.fieldsJson)
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // fall through
  }
  return {}
}