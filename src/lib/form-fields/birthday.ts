export const BIRTHDAY_START_YEAR = 1920

export function formatBirthdayIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatBirthdayDisplay(date: Date, lang: string): string {
  const locale = lang === "es" ? "es" : "en-US"
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function birthdayPlaceholder(lang: string): string {
  return lang === "es" ? "DD/MM/AAAA" : "DD/MM/YYYY"
}

export type BirthdayParts = {
  day: string
  month: string
  year: string
}

export function birthdaySegmentPlaceholders(lang: string): BirthdayParts {
  return lang === "es"
    ? { day: "DD", month: "MM", year: "AAAA" }
    : { day: "DD", month: "MM", year: "YYYY" }
}

export function birthdaySegmentAriaLabels(lang: string): BirthdayParts {
  return lang === "es"
    ? { day: "Día", month: "Mes", year: "Año" }
    : { day: "Day", month: "Month", year: "Year" }
}

function stripBirthdaySegmentDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength)
}

export function normalizeBirthdayDayInput(value: string): string {
  return stripBirthdaySegmentDigits(value, 2)
}

export function normalizeBirthdayMonthInput(value: string): string {
  return stripBirthdaySegmentDigits(value, 2)
}

export function normalizeBirthdayYearInput(value: string): string {
  return stripBirthdaySegmentDigits(value, 4)
}

export function padBirthdayDayMonthSegment(value: string): string {
  const digits = stripBirthdaySegmentDigits(value, 2)
  if (!digits) {
    return ""
  }
  return digits.length === 1 ? `0${digits}` : digits
}

export function splitBirthdayFieldValue(value: string): BirthdayParts {
  const trimmed = value.trim()
  if (!trimmed) {
    return { day: "", month: "", year: "" }
  }

  const fromSlashes = parseBirthdayDdMmYyyy(trimmed)
  if (fromSlashes) {
    return {
      day: String(fromSlashes.getDate()).padStart(2, "0"),
      month: String(fromSlashes.getMonth() + 1).padStart(2, "0"),
      year: String(fromSlashes.getFullYear()),
    }
  }

  const fromIso = parseBirthdayIso(trimmed)
  if (fromIso) {
    return {
      day: String(fromIso.getDate()).padStart(2, "0"),
      month: String(fromIso.getMonth() + 1).padStart(2, "0"),
      year: String(fromIso.getFullYear()),
    }
  }

  const digits = trimmed.replace(/\D/g, "").slice(0, 8)
  return {
    day: digits.slice(0, 2),
    month: digits.slice(2, 4),
    year: digits.slice(4, 8),
  }
}

export function composeBirthdayDdMmYyyy(parts: BirthdayParts): string {
  const day = padBirthdayDayMonthSegment(parts.day)
  const month = padBirthdayDayMonthSegment(parts.month)
  const year = normalizeBirthdayYearInput(parts.year)
  if (!day || !month || !year) {
    return ""
  }
  return `${day}/${month}/${year}`
}

/** Value for the named hidden/submit field: ISO when valid, else DD/MM/YYYY when complete but invalid. */
export function resolveBirthdaySubmitValue(parts: BirthdayParts): string {
  const hasAny =
    parts.day.trim().length > 0 ||
    parts.month.trim().length > 0 ||
    parts.year.trim().length > 0
  if (!hasAny) {
    return ""
  }

  const composed = composeBirthdayDdMmYyyy(parts)
  if (parts.year.length < 4 || !parts.day.trim() || !parts.month.trim()) {
    return ""
  }

  const parsed = parseBirthdayDdMmYyyy(composed)
  if (parsed && isValidBirthdayDate(parsed)) {
    return formatBirthdayIso(parsed)
  }

  return composed
}

export function formatBirthdayDdMmYyyyFromFieldValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  const fromSlashes = parseBirthdayDdMmYyyy(trimmed)
  if (fromSlashes) {
    const day = String(fromSlashes.getDate()).padStart(2, "0")
    const month = String(fromSlashes.getMonth() + 1).padStart(2, "0")
    const year = fromSlashes.getFullYear()
    return `${day}/${month}/${year}`
  }

  const fromIso = parseBirthdayIso(trimmed)
  if (fromIso) {
    const day = String(fromIso.getDate()).padStart(2, "0")
    const month = String(fromIso.getMonth() + 1).padStart(2, "0")
    const year = fromIso.getFullYear()
    return `${day}/${month}/${year}`
  }

  return formatBirthdayDigitsInput(trimmed)
}

export function formatBirthdayDigitsInput(digits: string): string {
  const onlyDigits = digits.replace(/\D/g, "").slice(0, 8)
  if (onlyDigits.length <= 2) {
    return onlyDigits
  }
  if (onlyDigits.length <= 4) {
    return `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2)}`
  }
  return `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2, 4)}/${onlyDigits.slice(4)}`
}

export function parseBirthdayDdMmYyyy(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])

  if (month < 1 || month > 12 || day < 1) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function parseBirthdayIso(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function startOfLocalDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function isValidBirthdayDate(date: Date): boolean {
  const today = startOfLocalDay(new Date())
  const start = new Date(BIRTHDAY_START_YEAR, 0, 1)
  const candidate = startOfLocalDay(date)
  return candidate >= start && candidate <= today
}

export function isValidBirthdayFieldValue(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }

  const parsed =
    parseBirthdayDdMmYyyy(trimmed) ?? parseBirthdayIso(trimmed)
  return parsed !== null && isValidBirthdayDate(parsed)
}

export function normalizeBirthdayForSubmit(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  const parsed =
    parseBirthdayDdMmYyyy(trimmed) ?? parseBirthdayIso(trimmed)
  if (!parsed || !isValidBirthdayDate(parsed)) {
    return trimmed
  }

  return formatBirthdayIso(parsed)
}

export function birthdayRequiredMessage(lang: string): string {
  return lang === "es"
    ? "Ingresa tu fecha de nacimiento."
    : "Enter your date of birth."
}

export function birthdayValidationMessage(lang: string): string {
  return lang === "es"
    ? "Ingresa una fecha válida (DD/MM/AAAA)."
    : "Enter a valid date (DD/MM/YYYY)."
}