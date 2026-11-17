const SANTIAGO_TZ = "America/Santiago"
const DISPLAY_LOCALE = "es-CL"

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
): { dateLine: string; timeLine: string } {
  return {
    dateLine: formatEventDateLong(startIso),
    timeLine: formatEventTimeRange(startIso, endIso),
  }
}