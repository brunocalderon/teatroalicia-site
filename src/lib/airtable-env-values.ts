export type AirtableCarteleraEnvValues = {
  token: string
  baseId: string
  tableId: string
  viewId?: string
}

export function resolveAirtableCarteleraConfigFromValues(
  values: Record<string, string | undefined>,
): AirtableCarteleraEnvValues | undefined {
  const token = (values.AIRTABLE_TOKEN ?? "").trim()
  const baseId = (values.AIRTABLE_BASE_ID ?? "").trim()

  if (!token || !baseId) {
    return undefined
  }

  const tableId =
    (values.AIRTABLE_CARTELERA_TABLE_ID ?? "").trim() ||
    (values.AIRTABLE_TABLE_ID ?? "").trim()
  if (!tableId) {
    return undefined
  }

  const viewId = (values.AIRTABLE_CARTELERA_VIEW_ID ?? "").trim()

  return {
    token,
    baseId,
    tableId,
    ...(viewId ? { viewId } : {}),
  }
}