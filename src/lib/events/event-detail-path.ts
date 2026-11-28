/** Canonical public URL path for a cartelera event detail page. */
export function eventDetailPath(eventId: string): string {
  const trimmed = eventId.trim()
  if (!trimmed) {
    throw new Error("eventDetailPath requires a non-empty eventId")
  }
  return `/eventos/${trimmed}`
}