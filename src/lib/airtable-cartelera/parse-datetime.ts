const SPANISH_MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
}

function hour12To24(hour12: number, meridiem: string): number {
  const period = meridiem.toLowerCase()
  if (period === "am") {
    return hour12 === 12 ? 0 : hour12
  }
  return hour12 === 12 ? 12 : hour12 + 12
}

/** `cellFormat=string` + `userLocale=es_CL` (e.g. "27 de noviembre de 2026 8:30pm"). */
function parseAirtableSpanishLocaleDateTime(value: string): string | undefined {
  const match = value.match(
    /^(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/iu,
  )
  if (!match) {
    return undefined
  }

  const [, dayRaw, monthName, year, hourRaw, minute, meridiem] = match
  const month = SPANISH_MONTHS[monthName!.toLowerCase()]
  if (!month) {
    return undefined
  }

  const hour = hour12To24(Number(hourRaw), meridiem!)
  const candidate = `${year}-${String(month).padStart(2, "0")}-${dayRaw!.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00-03:00`
  return Number.isNaN(Date.parse(candidate)) ? undefined : candidate
}

/** Normalizes Airtable date strings to ISO 8601 for cartelera. */
export function parseAirtableEventDateTime(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return Number.isNaN(Date.parse(trimmed)) ? undefined : trimmed
  }

  const localMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  )
  if (localMatch) {
    const [, datePart, hour, minute, second = "00"] = localMatch
    const candidate = `${datePart}T${hour.padStart(2, "0")}:${minute}:${second.padStart(2, "0")}-03:00`
    return Number.isNaN(Date.parse(candidate)) ? undefined : candidate
  }

  const localized = parseAirtableSpanishLocaleDateTime(trimmed)
  if (localized) {
    return localized
  }

  if (Number.isNaN(Date.parse(trimmed))) {
    return undefined
  }
  return trimmed
}