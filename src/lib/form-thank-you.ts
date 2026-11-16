export const DEFAULT_THANK_YOU_BODY =
  "We received your request and will get back to you soon."

/** Split markdown `thankYouBody` into trimmed paragraphs for `ThankYouBody`. */
export function parseThankYouParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

/** Rest segments for `src/pages/[...formBasePath]/[thankYouSlug].astro`. */
export function thankYouRouteParams(
  formPath: string,
  thankYouPath: string
): { formBasePath: string; thankYouSlug: string } {
  const formBasePath = formPath.replace(/^\//, "")
  const thankYouNormalized = thankYouPath.replace(/^\//, "")
  const slug = thankYouNormalized
    .slice(formBasePath.length)
    .replace(/^\//, "")
  if (!slug) {
    throw new Error(
      `thankYouPath must extend form path (path="${formPath}", thankYouPath="${thankYouPath}")`
    )
  }
  return { formBasePath, thankYouSlug: slug }
}

/** Prefix rendered thank-you HTML (`<p>…</p>`) with the guest's first name when known. */
export function prefixThankYouFirstParagraphHtml(
  html: string,
  firstName: string,
  locale = "en"
): string {
  const trimmed = html.trim()
  if (!trimmed || !firstName) {
    return trimmed
  }
  if (typeof DOMParser === "undefined") {
    return trimmed
  }
  const doc = new DOMParser().parseFromString(
    `<div id="thank-you-root">${trimmed}</div>`,
    "text/html"
  )
  const root = doc.getElementById("thank-you-root")
  const paragraph = root?.querySelector("p")
  if (!paragraph) {
    return trimmed
  }

  const walker = doc.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
  const firstText = walker.nextNode()
  if (firstText?.textContent) {
    const content = firstText.textContent
    const leading = content.match(/^\s*/)?.[0] ?? ""
    const rest = content.slice(leading.length)
    if (rest.length > 0) {
      firstText.textContent =
        leading +
        rest.charAt(0).toLocaleLowerCase(locale) +
        rest.slice(1)
    }
  }

  paragraph.insertBefore(doc.createTextNode(`${firstName}, `), paragraph.firstChild)
  return root?.innerHTML ?? trimmed
}

/** Prefix the opening thank-you sentence with the guest's first name when known. */
export function prefixThankYouFirstParagraph(
  paragraph: string,
  firstName: string,
  locale = "en"
): string {
  const trimmed = paragraph.trim()
  if (!trimmed) {
    return trimmed
  }
  if (!firstName) {
    return trimmed
  }
  const lowercased =
    trimmed.charAt(0).toLocaleLowerCase(locale) + trimmed.slice(1)
  return `${firstName}, ${lowercased}`
}

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
  firstNameRaw: string,
  extraSearchParams?: URLSearchParams
): string {
  const url = new URL(thankYouPath, origin)
  const firstName = formatThankYouFirstName(firstNameRaw)
  if (firstName) {
    url.searchParams.set(THANK_YOU_NAME_QUERY_PARAM, firstName)
  }
  if (extraSearchParams) {
    for (const [key, value] of extraSearchParams.entries()) {
      if (key === THANK_YOU_NAME_QUERY_PARAM) {
        continue
      }
      url.searchParams.set(key, value)
    }
  }
  return url.href
}

export function buildThankYouRedirectUrl(
  thankYouPath: string,
  origin: string,
  form: HTMLFormElement,
  firstNameFieldName = "firstName",
  currentSearchParams?: URLSearchParams
): string {
  return appendThankYouNameToUrl(
    thankYouPath,
    origin,
    readFirstNameFromForm(form, firstNameFieldName),
    currentSearchParams
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
