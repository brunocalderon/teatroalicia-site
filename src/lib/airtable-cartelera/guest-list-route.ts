import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

/** Build `/i/{slug}` when the guest list is open or was configured (closed state). */
export function airtableRowHasGuestListRoute(row: AirtableCarteleraRow): boolean {
  if (row.guestListEnabled) {
    return true
  }
  return Boolean(row.guestListFieldsRaw?.trim())
}