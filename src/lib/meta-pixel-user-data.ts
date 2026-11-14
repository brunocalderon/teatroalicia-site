import { parseInstagramUsername } from "@/lib/form-fields/instagram"
import type { FormField } from "@/lib/form-schema"
import { MARKETING_TRACKING_CITY } from "@/lib/marketing-page-tracking"

/** Manual advanced-matching keys accepted by the Meta Pixel (hashed client-side by fbq). */
export type MetaPixelUserData = Partial<{
  em: string
  ph: string
  fn: string
  ln: string
  db: string
  ct: string
  country: string
  external_id: string
}>

const DEFAULT_META_COUNTRY = "cl"

function readFormControlValue(form: HTMLFormElement, name: string): string {
  const item = form.elements.namedItem(name)
  if (!item) {
    return ""
  }

  if (item instanceof RadioNodeList) {
    for (let index = 0; index < item.length; index += 1) {
      const node = item[index]
      if (node instanceof HTMLInputElement && node.checked) {
        return node.value.trim()
      }
    }
    return ""
  }

  if (
    item instanceof HTMLInputElement ||
    item instanceof HTMLTextAreaElement ||
    item instanceof HTMLSelectElement
  ) {
    if (
      item instanceof HTMLInputElement &&
      (item.type === "checkbox" || item.type === "radio")
    ) {
      return item.checked ? item.value.trim() : ""
    }
    return item.value.trim()
  }

  return ""
}

function normalizeMetaPersonName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}]/gu, "")
}

function normalizeMetaEmail(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeMetaPhone(value: string): string {
  return value.replace(/\D/g, "")
}

function normalizeMetaBirthdate(value: string): string {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    return `${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`
  }

  const digits = value.replace(/\D/g, "")
  if (digits.length === 8) {
    return digits
  }
  return ""
}

function normalizeMetaCity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "")
}

function normalizeMetaExternalId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "")
}

function isDocumentIdField(field: FormField): boolean {
  return (
    field.type === "text" &&
    (field.name === "id" ||
      field.name === "documentId" ||
      field.name === "rut" ||
      field.name === "passport")
  )
}

export type BuildMetaPixelUserDataOptions = {
  nameFields?: string[]
  city?: string
  country?: string
}

/**
 * Collects normalized PII for Meta manual advanced matching from the live form DOM.
 * Values are plain text; the Pixel SHA-256-hashes them before sending to Meta.
 */
export function buildMetaPixelUserDataFromForm(
  form: HTMLFormElement,
  fields: FormField[],
  options: BuildMetaPixelUserDataOptions = {}
): MetaPixelUserData {
  const data: MetaPixelUserData = {}
  const nameFields = options.nameFields ?? []

  if (nameFields[0]) {
    const fn = normalizeMetaPersonName(readFormControlValue(form, nameFields[0]))
    if (fn) {
      data.fn = fn
    }
  }
  if (nameFields[1]) {
    const ln = normalizeMetaPersonName(readFormControlValue(form, nameFields[1]))
    if (ln) {
      data.ln = ln
    }
  }

  for (const field of fields) {
    const raw = readFormControlValue(form, field.name)
    if (!raw) {
      continue
    }

    switch (field.type) {
      case "email":
        if (!data.em) {
          const em = normalizeMetaEmail(raw)
          if (em) {
            data.em = em
          }
        }
        break
      case "tel": {
        if (!data.ph) {
          const ph = normalizeMetaPhone(raw)
          if (ph) {
            data.ph = ph
          }
        }
        break
      }
      case "date": {
        const db = normalizeMetaBirthdate(raw)
        if (db) {
          data.db = db
        }
        break
      }
      case "text":
        if (field.name === "firstName" && !data.fn) {
          const fn = normalizeMetaPersonName(raw)
          if (fn) {
            data.fn = fn
          }
        } else if (field.name === "lastName" && !data.ln) {
          const ln = normalizeMetaPersonName(raw)
          if (ln) {
            data.ln = ln
          }
        } else if (isDocumentIdField(field) && !data.external_id) {
          const externalId = normalizeMetaExternalId(raw)
          if (externalId) {
            data.external_id = externalId
          }
        }
        break
      case "instagram":
        if (!data.external_id) {
          const handle = normalizeMetaExternalId(parseInstagramUsername(raw))
          if (handle) {
            data.external_id = `ig:${handle}`
          }
        }
        break
      default:
        break
    }
  }

  const city = normalizeMetaCity(options.city ?? MARKETING_TRACKING_CITY)
  if (city) {
    data.ct = city
  }

  const country = (options.country ?? DEFAULT_META_COUNTRY).trim().toLowerCase()
  if (country) {
    data.country = country
  }

  return data
}