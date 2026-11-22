const SANTIAGO_TZ = "America/Santiago"

/** Offset string like `-03:00` for an instant in America/Santiago. */
export function santiagoUtcOffset(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date for Santiago offset")
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SANTIAGO_TZ,
    timeZoneName: "shortOffset",
  }).formatToParts(date)

  const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT"
  const match = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/)
  if (!match) {
    return "-03:00"
  }
  const sign = match[1]
  const hours = match[2]!.padStart(2, "0")
  const minutes = (match[3] ?? "00").padStart(2, "0")
  return `${sign}${hours}:${minutes}`
}

/** Returns true when the ISO string's numeric offset matches Santiago for that instant. */
export function isoOffsetMatchesSantiago(iso: string): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return false
  }
  const offsetMatch = iso.match(/([+-]\d{2}:\d{2}|Z)$/)
  if (!offsetMatch) {
    return false
  }
  const stated = offsetMatch[1] === "Z" ? "+00:00" : offsetMatch[1]!
  return stated === santiagoUtcOffset(date)
}

export function isUpcomingEventStart(iso: string, now: Date): boolean {
  const start = new Date(iso)
  if (Number.isNaN(start.getTime())) {
    return false
  }
  return start.getTime() >= now.getTime()
}

/**
 * Home cartelera: keep events until `eventEnd` (nightlife runs past start time).
 * Without an end, falls back to `isUpcomingEventStart`.
 */
export function isCarteleraEventVisible(
  eventStart: string,
  eventEnd: string | undefined,
  now: Date,
): boolean {
  const endIso = eventEnd?.trim()
  if (endIso) {
    const end = new Date(endIso)
    if (!Number.isNaN(end.getTime())) {
      return end.getTime() >= now.getTime()
    }
  }
  return isUpcomingEventStart(eventStart, now)
}