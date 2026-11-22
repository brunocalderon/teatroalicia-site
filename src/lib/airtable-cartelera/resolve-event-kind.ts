import {
  formEventKindSchema,
  type FormEventKind,
} from "@/lib/form-schema"

/** Maps Airtable `Event Kind` to schema.org event types (defaults `general`). */
export function resolveAirtableCarteleraEventKind(
  raw: string | undefined,
): FormEventKind {
  const trimmed = raw?.trim()
  if (!trimmed) {
    return "general"
  }
  const parsed = formEventKindSchema.safeParse(trimmed)
  return parsed.success ? parsed.data : "general"
}