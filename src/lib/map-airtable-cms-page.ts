import type { CmsPageData } from "@/lib/cms-page-schema"

export type AirtableFieldSet = Record<string, unknown>

export type MapAirtableCmsPageResult =
  | { ok: true; data: CmsPageData }
  | { ok: false; recordId: string; message: string }

function readSingleLine(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

function readBody(value: unknown): string {
  if (typeof value === "string") {
    return value
  }
  return ""
}

/** Maps one Airtable row to CMS page data (column names match the base contract). */
export function mapAirtableCmsPageFields(
  recordId: string,
  fields: AirtableFieldSet,
): MapAirtableCmsPageResult {
  const slug = readSingleLine(fields.slug)
  if (!slug) {
    return {
      ok: false,
      recordId,
      message: "missing or empty slug",
    }
  }

  const path = readSingleLine(fields.path)
  if (!path) {
    return {
      ok: false,
      recordId,
      message: `missing or empty path (slug: ${slug})`,
    }
  }

  const title = readSingleLine(fields.title)
  if (!title) {
    return {
      ok: false,
      recordId,
      message: `missing or empty title (slug: ${slug})`,
    }
  }

  const description = readSingleLine(fields.description)
  const lang = readSingleLine(fields.lang) ?? "es"
  const body = readBody(fields.body)

  return {
    ok: true,
    data: {
      slug,
      path,
      title,
      body,
      description,
      lang,
    },
  }
}