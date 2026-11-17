import {
  AIRTABLE_BASE_ID,
  AIRTABLE_CMS_TABLE_ID,
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

/** Credentials for `cmsPages` (optional CMS table). */
export function resolveAirtableCmsConfig():
  | {
      token: string
      baseId: string
      tableId: string
    }
  | undefined {
  const connection = resolveAirtableConnection()
  if (!connection) {
    return undefined
  }

  const tableId = AIRTABLE_CMS_TABLE_ID.trim()
  if (!tableId) {
    return undefined
  }

  return { ...connection, tableId }
}

/** Credentials for `airtableRecords` (`/airtable` routes). */
export function resolveAirtableBrowseConfig():
  | {
      token: string
      baseId: string
      tableId: string
    }
  | undefined {
  const connection = resolveAirtableConnection()
  if (!connection) {
    return undefined
  }

  const tableId = AIRTABLE_TABLE_ID.trim()
  if (!tableId) {
    return undefined
  }

  return { ...connection, tableId }
}