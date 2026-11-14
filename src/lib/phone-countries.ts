import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js"

const PINNED_FIRST_COUNTRY_CODE: CountryCode = "CL"

export const DEFAULT_PHONE_COUNTRY_CODE: CountryCode = PINNED_FIRST_COUNTRY_CODE

export function countryCodeToFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("")
}

export type PhoneCountryOption = {
  code: CountryCode
  name: string
  callingCode: string
  flag: string
}

function regionLabel(code: CountryCode, lang: string) {
  if (typeof Intl === "undefined") {
    return code
  }
  const locale = lang === "es" ? "es" : "en"
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
  } catch {
    return code
  }
}

export function buildPhoneCountryOptions(lang: string): PhoneCountryOption[] {
  const locale = lang === "es" ? "es" : "en"
  const options = getCountries().map((code) => ({
    code,
    name: regionLabel(code, lang),
    callingCode: `+${getCountryCallingCode(code)}`,
    flag: countryCodeToFlagEmoji(code),
  }))

  const pinned = options.find((option) => option.code === PINNED_FIRST_COUNTRY_CODE)
  const rest = options
    .filter((option) => option.code !== PINNED_FIRST_COUNTRY_CODE)
    .sort((a, b) => a.name.localeCompare(b.name, locale))

  return pinned ? [pinned, ...rest] : rest
}

export function filterPhoneCountryOptions(
  query: string,
  options: PhoneCountryOption[]
) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return options
  }

  return options.filter(
    (option) =>
      option.name.toLowerCase().includes(normalized) ||
      option.code.toLowerCase().includes(normalized) ||
      option.callingCode.includes(normalized.replace(/\s/g, ""))
  )
}