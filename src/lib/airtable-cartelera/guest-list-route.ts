import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

export type GuestListRouteKind = "invite" | "redirect" | "none"

/** All three guest-pass columns set (trimmed non-empty). */
export function airtableRowHasGuestPassConfig(row: AirtableCarteleraRow): boolean {
  return Boolean(
    row.supplierEventId?.trim() &&
      row.guestListFieldsRaw?.trim() &&
      row.guestPassTicketId?.trim(),
  )
}

/** Which `/i/{slug}` experience to publish, if any. */
export function resolveGuestListRouteKind(
  row: AirtableCarteleraRow,
): GuestListRouteKind {
  if (!airtableRowHasGuestPassConfig(row)) {
    return "none"
  }
  return row.guestListEnabled ? "invite" : "redirect"
}

/** Build `/i/{slug}` when invite or redirect experience applies. */
export function airtableRowHasGuestListRoute(row: AirtableCarteleraRow): boolean {
  return resolveGuestListRouteKind(row) !== "none"
}