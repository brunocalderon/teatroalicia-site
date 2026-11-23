import {
  readAirtableBoolean,
  readAirtableField,
  type AirtableFieldSet,
} from "../airtable-cartelera/read-field.ts"
import type { PromoterRosterEntry } from "../promoters-roster-types.ts"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type MapAirtablePromoterResult =
  | { ok: true; data: PromoterRosterEntry }
  | { ok: false; recordId: string; message: string }

export function mapAirtablePromoterRecord(
  airtableRecordId: string,
  fieldsInput: AirtableFieldSet,
): MapAirtablePromoterResult {
  const fields = fieldsInput

  const id = readAirtableField(fields, ["ID", "id", "Slug", "slug"])
  if (!id) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: "missing ID",
    }
  }
  if (!SLUG_PATTERN.test(id)) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `invalid ID slug (${id})`,
    }
  }

  const name = readAirtableField(fields, ["Name", "name"])
  if (!name) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `missing Name (id: ${id})`,
    }
  }

  return {
    ok: true,
    data: {
      id,
      name,
      active:
        readAirtableBoolean(fields, ["Active", "active"]) ?? false,
      ticket_sale_enabled:
        readAirtableBoolean(fields, [
          "Ticket Sales Enabled",
          "ticket_sale_enabled",
          "Ticket Sale Enabled",
        ]) ?? false,
      guest_pass_enabled:
        readAirtableBoolean(fields, [
          "Guest Passes Enabled",
          "guest_pass_enabled",
          "Guest Pass Enabled",
        ]) ?? false,
    },
  }
}