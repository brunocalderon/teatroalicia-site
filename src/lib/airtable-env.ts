import {
  AIRTABLE_BASE_ID,
  AIRTABLE_CARTELERA_TABLE_ID,
  AIRTABLE_CARTELERA_VIEW_ID,
  AIRTABLE_TABLE_ID,
  AIRTABLE_TOKEN,
} from "astro:env/server"

function resolveAirtableConnection():
  | {
      token: string
      baseId: string
    }
  | undefined {
  const token = AIRTABLE_TOKEN.trim()
  const baseId = AIRTABLE_BASE_ID.trim()

  if (!token || !baseId) {
    return undefined
  }

  return { token, baseId }
}

/** Credentials for home cartelera (falls back to `AIRTABLE_TABLE_ID`). */
export function resolveAirtableCarteleraConfig():
  | {
      token: string
      baseId: string
      tableId: string
      viewId?: string
    }
  | undefined {
  const connection = resolveAirtableConnection()
  if (!connection) {
    return undefined
  }

  const tableId =
    (AIRTABLE_CARTELERA_TABLE_ID ?? "").trim() ||
    (AIRTABLE_TABLE_ID ?? "").trim()
  if (!tableId) {
    return undefined
  }

  const viewId = (AIRTABLE_CARTELERA_VIEW_ID ?? "").trim()

  return {
    ...connection,
    tableId,
    ...(viewId ? { viewId } : {}),
  }
}