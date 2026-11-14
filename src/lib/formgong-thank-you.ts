/** Title-case a first name for thank-you copy (e.g. `bruno` → `Bruno`). */
export function formatThankYouFirstName(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return ""
  }
  return trimmed
    .split(/\s+/)
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ")
}

function sanitizeThankYouNameParam(raw: string): string {
  return raw.trim().slice(0, 80).replace(/[*_\[\]`#\\]/g, "")
}

export const THANK_YOU_NAME_QUERY_PARAM = "name"

export function readFirstNameFromForm(
  form: HTMLFormElement,
  fieldName = "firstName"
): string {
  const field = form.elements.namedItem(fieldName)
  if (field instanceof HTMLInputElement) {
    return field.value
  }
  return (
    form.querySelector<HTMLInputElement>(`[name="${fieldName}"]`)?.value ?? ""
  )
}

export function appendThankYouNameToUrl(
  thankYouPath: string,
  origin: string,
  firstNameRaw: string
): string {
  const url = new URL(thankYouPath, origin)
  const firstName = formatThankYouFirstName(firstNameRaw)
  if (firstName) {
    url.searchParams.set(THANK_YOU_NAME_QUERY_PARAM, firstName)
  }
  return url.href
}

export function buildThankYouRedirectUrl(
  thankYouPath: string,
  origin: string,
  form: HTMLFormElement,
  firstNameFieldName = "firstName"
): string {
  return appendThankYouNameToUrl(
    thankYouPath,
    origin,
    readFirstNameFromForm(form, firstNameFieldName)
  )
}

/** Title-case name fields on the form before POST and redirect. */
export function normalizeFormNameFields(
  form: HTMLFormElement,
  fieldNames: readonly string[] = ["firstName", "lastName"]
): void {
  for (const fieldName of fieldNames) {
    const field = form.elements.namedItem(fieldName)
    if (field instanceof HTMLInputElement) {
      field.value = formatThankYouFirstName(field.value)
    }
  }
}
