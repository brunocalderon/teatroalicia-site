import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js"

const PRIORITY_COUNTRY_CODES: CountryCode[] = ["CL", "MX", "US", "AR"]

export const DEFAULT_PHONE_COUNTRY_CODE: CountryCode = "CL"

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
  const options = getCountries().map((code) => ({
    code,
    name: regionLabel(code, lang),
    callingCode: `+${getCountryCallingCode(code)}`,
    flag: countryCodeToFlagEmoji(code),
  }))

  const priority = PRIORITY_COUNTRY_CODES.flatMap((code) => {
    const match = options.find((option) => option.code === code)
    return match ? [match] : []
  })

  const rest = options
    .filter((option) => !PRIORITY_COUNTRY_CODES.includes(option.code))
    .sort((a, b) => a.name.localeCompare(b.name, lang === "es" ? "es" : "en"))

  return [...priority, ...rest]
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