import { CANONICAL_SITE_ORIGIN } from "./canonical-origin"

export const VENUE_ENTITY_ID = `${CANONICAL_SITE_ORIGIN}/#teatro-alicia`
export const WEBSITE_ENTITY_ID = `${CANONICAL_SITE_ORIGIN}/#website`
export const HOME_WEBPAGE_ENTITY_ID = `${CANONICAL_SITE_ORIGIN}/#webpage`
export const UPCOMING_EVENTS_LIST_ID = `${CANONICAL_SITE_ORIGIN}/#upcoming-events`

export function eventEntityId(eventId: string): string {
  const slug = eventId.trim()
  return `${CANONICAL_SITE_ORIGIN}/#event-${slug}`
}

export function webPageEntityId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#webpage`
}

/** @deprecated Use entity constants; kept for transitional imports. */
export function venueNodeId(_origin: string): string {
  return VENUE_ENTITY_ID
}