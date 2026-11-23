import type { FormField } from "@/lib/form-schema"

/** Airtable `Guest List Fields` column — JSON array; returns empty when unset. */
export function parseAirtableInvitationFormFields(
  raw: string | undefined,
): FormField[] {
  const trimmed = raw?.trim()
  if (!trimmed) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as FormField[]
  } catch {
    return []
  }
}