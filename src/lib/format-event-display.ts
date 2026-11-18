const SANTIAGO_TZ = "America/Santiago"
const DISPLAY_LOCALE = "es-CL"

function capitalizeFirst(value: string): string {
  if (!value) {
    return value
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function stripTrailingDot(value: string): string {
  return value.replace(/\.\s*$/u, "")
}

/** Long date for event cards (e.g. "jueves, 20 de noviembre de 2026"). */
export function formatEventDateLong(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: SANTIAGO_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

/** Home cartelera date (e.g. "Vie, 20 de Nov de 2026"). */
export function formatEventDateHome(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const formatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: SANTIAGO_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const parts = formatter.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? ""

  const weekday = capitalizeFirst(stripTrailingDot(part("weekday")))
  const day = part("day")
  const month = capitalizeFirst(stripTrailingDot(part("month")))
  const year = part("year")

  if (!day || !month || !year) {
    return ""
  }

  const weekdayPrefix = weekday ? `${weekday}, ` : ""
  return `${weekdayPrefix}${day} de ${month} de ${year}`
}

/** Time range in Santiago (e.g. "21:00 – 02:00" when end is provided). */
export function formatEventTimeRange(
  startIso: string,
  endIso?: string,
): string {
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) {
    return ""
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: SANTIAGO_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }
  const startLabel = new Intl.DateTimeFormat(DISPLAY_LOCALE, timeOptions).format(
    start,
  )

  if (!endIso?.trim()) {
    return `Desde las ${startLabel}`
  }

  const end = new Date(endIso)
  if (Number.isNaN(end.getTime())) {
    return `Desde las ${startLabel}`
  }

  const endLabel = new Intl.DateTimeFormat(DISPLAY_LOCALE, timeOptions).format(
    end,
  )
  return `${startLabel} – ${endLabel}`
}

/** Compact line for cards: date + time. */
export function formatEventSchedule(
  startIso: string,
  endIso?: string,
  options?: { date?: "long" | "home" },
): { dateLine: string; timeLine: string } {
  const dateStyle = options?.date ?? "long"
  return {
    dateLine:
      dateStyle === "home"
        ? formatEventDateHome(startIso)
        : formatEventDateLong(startIso),
    timeLine: formatEventTimeRange(startIso, endIso),
  }
}