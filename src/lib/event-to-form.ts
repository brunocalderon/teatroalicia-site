import type { FormEntryData } from "@/lib/form-schema"
import {
  type EventEntryData,
  resolveEventInvitationPath,
} from "@/lib/event-schema"

/** Minimal form-shaped data for JSON-LD when the event has no invitation route. */
export function eventToSchemaFormData(event: EventEntryData): FormEntryData {
  const invited = eventToFormEntryData(event)
  if (invited) {
    return invited
  }

  return {
    title: event.title,
    description: event.description,
    path: `/e/${event.slug}`,
    thankYouPath: `/e/${event.slug}/gracias`,
    eventId: event.eventId,
    eventStart: event.eventStart,
    eventEnd: event.eventEnd,
    eventStatus: event.eventStatus,
    eventAttendanceMode: event.eventAttendanceMode,
    eventKind: event.eventKind,
    performer: event.performer,
    organizer: event.organizer,
    organizerIsVenue: event.organizerIsVenue,
    ticketUrl: event.ticketUrl,
    ticketLink: event.ticketLink,
    ticketOffers: event.ticketOffers,
    isAccessibleForFree: event.isAccessibleForFree,
    typicalAgeRange: event.typicalAgeRange,
    eventMaximumAttendeeCapacity: event.eventMaximumAttendeeCapacity,
    token: "no-invitation-form",
    lang: event.lang,
    submitLabel: "Submit",
    image: event.image,
    imageAlt: event.imageAlt,
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        required: false,
      },
    ],
  }
}

/** Maps event markdown with `invitation` into the shape used by form routes. */
export function eventToFormEntryData(
  event: EventEntryData,
): FormEntryData | undefined {
  if (!event.invitation) {
    return undefined
  }

  const inv = event.invitation
  const path = resolveEventInvitationPath(event)

  return {
    title: event.title,
    description: event.description,
    path,
    thankYouPath: inv.thankYouPath,
    eventId: event.eventId,
    eventStart: event.eventStart,
    eventEnd: event.eventEnd,
    eventStatus: event.eventStatus,
    eventAttendanceMode: event.eventAttendanceMode,
    eventKind: event.eventKind,
    performer: event.performer,
    organizer: event.organizer,
    organizerIsVenue: event.organizerIsVenue,
    ticketUrl: event.ticketUrl,
    ticketLink: event.ticketLink,
    ticketOffers: event.ticketOffers,
    invitationOnly: inv.invitationOnly,
    isAccessibleForFree: event.isAccessibleForFree,
    typicalAgeRange: event.typicalAgeRange,
    eventMaximumAttendeeCapacity: event.eventMaximumAttendeeCapacity,
    token: inv.token,
    lang: inv.lang ?? event.lang,
    submitLabel: inv.submitLabel,
    nameFields: inv.nameFields,
    messages: inv.messages,
    image: event.image,
    imageAlt: event.imageAlt,
    livestackFooter: inv.livestackFooter,
    fields: inv.fields,
  }
}