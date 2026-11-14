import parsePhoneNumberFromString, {
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js"
import examples from "libphonenumber-js/examples.mobile.json"

const nationalPlaceholderByCountry = new Map<CountryCode, string>()

/** When libphonenumber’s mobile example is not the usual user-facing format. */
const PHONE_NATIONAL_PLACEHOLDER_OVERRIDES: Partial<
  Record<CountryCode, string>
> = {
  CL: "(9) 9876 5432",
}

/** National-format sample for the selected country (libphonenumber mobile examples). */
export function phoneNationalPlaceholder(country: CountryCode): string {
  const cached = nationalPlaceholderByCountry.get(country)
  if (cached !== undefined) {
    return cached
  }

  const override = PHONE_NATIONAL_PLACEHOLDER_OVERRIDES[country]
  if (override) {
    nationalPlaceholderByCountry.set(country, override)
    return override
  }

  const example = getExampleNumber(country, examples)
  const placeholder = example?.formatNational() ?? ""
  nationalPlaceholderByCountry.set(country, placeholder)
  return placeholder
}

export function phoneSearchPlaceholder(lang: string): string {
  return lang === "es" ? "Buscar país" : "Search country"
}

export function phoneSearchAriaLabel(lang: string): string {
  return lang === "es" ? "Buscar país" : "Search country"
}

export function phoneValidationMessage(lang: string): string {
  return lang === "es"
    ? "Ingresa un número de teléfono válido."
    : "Enter a valid phone number."
}

export type NormalizedPhoneNationalInput = {
  country: CountryCode
  nationalDisplay: string
  submitValue: string
  isValid: boolean
}

/** On blur: drop leading country code and show national format when parseable. */
export function normalizePhoneNationalInput(
  raw: string,
  selectedCountry: CountryCode
): NormalizedPhoneNationalInput {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      country: selectedCountry,
      nationalDisplay: "",
      submitValue: "",
      isValid: false,
    }
  }

  const candidates: string[] = []
  const compact = trimmed.replace(/\s/g, "")

  if (compact.startsWith("+")) {
    candidates.push(compact)
  } else if (compact.startsWith("00")) {
    candidates.push(`+${compact.slice(2)}`)
  }

  candidates.push(trimmed)

  const digitsOnly = trimmed.replace(/\D/g, "")
  if (digitsOnly.length > 0 && !compact.startsWith("+")) {
    candidates.push(`+${digitsOnly}`)
  }

  let phone = undefined
  for (const candidate of candidates) {
    phone = candidate.startsWith("+")
      ? parsePhoneNumberFromString(candidate)
      : parsePhoneNumberFromString(candidate, selectedCountry)
    if (phone?.isValid()) {
      break
    }
  }

  if (!phone?.isValid()) {
    const fallback = parsePhoneToSubmitValue(selectedCountry, trimmed)
    return {
      country: selectedCountry,
      nationalDisplay: trimmed,
      submitValue: fallback.submitValue,
      isValid: fallback.isValid,
    }
  }

  const country = phone.country ?? selectedCountry
  return {
    country,
    nationalDisplay: phone.formatNational(),
    submitValue: phone.format("E.164").replace(/^\+/, ""),
    isValid: true,
  }
}

export function parsePhoneToSubmitValue(
  country: CountryCode,
  nationalNumber: string
): { submitValue: string; isValid: boolean } {
  const trimmed = nationalNumber.trim()
  if (!trimmed) {
    return { submitValue: "", isValid: false }
  }

  const phone = parsePhoneNumberFromString(trimmed, country)
  if (!phone?.isValid()) {
    return { submitValue: "", isValid: false }
  }

  const e164 = phone.format("E.164")
  return { submitValue: e164.replace(/^\+/, ""), isValid: true }
}

export function isValidPhoneSubmitValue(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }
  const phone = parsePhoneNumberFromString(`+${trimmed.replace(/^\+/, "")}`)
  return Boolean(phone?.isValid())
}