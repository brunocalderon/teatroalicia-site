import { z } from "astro/zod"

const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase letters, numbers, and hyphens",
  )

/** `fields` object for home cartelera (`cellFormat=string`, `userLocale=es_CL`). */
export const airtableCarteleraFieldsSchema = z
  .object({
    Image: z.string().min(1).optional(),
    "Purchase Link": z.string().min(1).optional(),
    "Ticket Supplier": z.string().min(1).optional(),
    Slug: slugSchema.optional(),
    "Event Name": z.string().min(1).optional(),
    Start: z.string().min(1).optional(),
    "Event Kind": z.string().min(1).optional(),
    End: z.string().min(1).optional(),
    Title: z.string().min(1).optional(),
    // Optional publish gate (checkbox or string)
    Publish: z.union([z.boolean(), z.string()]).optional(),
    Published: z.union([z.boolean(), z.string()]).optional(),
    // Legacy / alternate column names
    eventId: z.string().min(1).optional(),
    "Event ID": z.string().min(1).optional(),
    eventStart: z.string().min(1).optional(),
    "Event Start": z.string().min(1).optional(),
    eventEnd: z.string().min(1).optional(),
    "Event End": z.string().min(1).optional(),
    ticketLink: z.string().min(1).optional(),
    ticketUrl: z.string().min(1).optional(),
    invitationPath: z.string().min(1).optional(),
    imageAlt: z.string().min(1).optional(),
    "Image Alt": z.string().min(1).optional(),
  })
  .catchall(z.unknown())

export type AirtableCarteleraFields = z.infer<typeof airtableCarteleraFieldsSchema>

export const airtableCarteleraRecordSchema = z.object({
  id: z.string().min(1),
  createdTime: z.string().optional(),
  fields: airtableCarteleraFieldsSchema,
})

export type AirtableCarteleraApiRecord = z.infer<
  typeof airtableCarteleraRecordSchema
>

export const airtableCarteleraListResponseSchema = z.object({
  records: z.array(airtableCarteleraRecordSchema),
  offset: z.string().optional(),
})

export type AirtableCarteleraListResponse = z.infer<
  typeof airtableCarteleraListResponseSchema
>

export function parseAirtableCarteleraListResponse(
  raw: unknown,
): AirtableCarteleraListResponse {
  return airtableCarteleraListResponseSchema.parse(raw)
}