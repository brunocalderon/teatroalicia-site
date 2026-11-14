import type { FormField } from "@/lib/form-schema"

import { getFieldDefinition } from "@/components/forms/fields/registry"

export function getFieldValue(form: HTMLFormElement, field: FormField): string {
  const named = form.elements.namedItem(field.name)

  if (field.type === "checkbox") {
    if (named instanceof HTMLInputElement) {
      return named.checked ? (named.value || "yes") : ""
    }
    return ""
  }

  if (field.type === "radio") {
    if (named instanceof RadioNodeList) {
      const selected = Array.from(named).find(
        (node): node is HTMLInputElement =>
          node instanceof HTMLInputElement && node.checked
      )
      return selected?.value ?? ""
    }
    if (named instanceof HTMLInputElement) {
      return named.checked ? named.value : ""
    }
    return ""
  }

  if (field.type === "file") {
    if (named instanceof HTMLInputElement && named.files?.length) {
      return named.files[0]?.name ?? "file"
    }
    return ""
  }

  if (named instanceof HTMLInputElement || named instanceof HTMLTextAreaElement) {
    return named.value
  }

  if (named instanceof HTMLSelectElement) {
    return named.value
  }

  return ""
}

export function normalizeConfiguredFields(
  form: HTMLFormElement,
  fields: readonly FormField[]
): void {
  for (const field of fields) {
    const def = getFieldDefinition(field.type)
    if (!def.normalize) {
      continue
    }
    const named = form.elements.namedItem(field.name)
    if (named instanceof HTMLInputElement && named.type !== "file") {
      named.value = def.normalize(named.value)
    }
  }
}

export function validateFieldValue(
  field: FormField,
  lang: string,
  value: string
): string | null {
  const def = getFieldDefinition(field.type)
  if (!def.validate) {
    return null
  }
  if (!value.trim() && !field.required) {
    return null
  }
  return def.validate({ lang, field, value })
}

export function validateConfiguredFields(
  form: HTMLFormElement,
  fields: readonly FormField[],
  lang: string
): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {}

  for (const field of fields) {
    const message = validateFieldValue(field, lang, getFieldValue(form, field))
    if (message) {
      errors[field.name] = message
    }
  }

  return errors
}
