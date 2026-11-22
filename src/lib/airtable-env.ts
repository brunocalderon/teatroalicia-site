import {
  AIRTABLE_BASE_ID,
  AIRTABLE_CARTELERA_TABLE_ID,
  AIRTABLE_CARTELERA_VIEW_ID,
  AIRTABLE_TABLE_ID,
  AIRTABLE_TOKEN,
} from "astro:env/server"

import { resolveAirtableCarteleraConfigFromValues } from "@/lib/airtable-env-values"

/** Credentials for home cartelera (falls back to `AIRTABLE_TABLE_ID`). */
export function resolveAirtableCarteleraConfig() {
  return resolveAirtableCarteleraConfigFromValues({
    AIRTABLE_TOKEN,
    AIRTABLE_BASE_ID,
    AIRTABLE_CARTELERA_TABLE_ID,
    AIRTABLE_TABLE_ID,
    AIRTABLE_CARTELERA_VIEW_ID,
  })
}