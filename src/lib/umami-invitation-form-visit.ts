import type { UmamiTrackEventData } from "@/lib/umami-track-event-data"

export const UMAMI_INVITATION_FORM_VISIT_EVENT = "Invitation Form Visit"

export function buildUmamiInvitationFormVisitData(
  eventName: string,
  eventId?: string,
): UmamiTrackEventData {
  const trimmedId = eventId?.trim() ?? ""
  return {
    event_name: eventName,
    ...(trimmedId ? { event_id: trimmedId } : {}),
  }
}

/** Thank-you Umami track — `event_id` is always sent (may be empty). */
export function buildUmamiInvitationReceivedData(
  eventName: string,
  eventId?: string,
): UmamiTrackEventData {
  return {
    event_name: eventName,
    event_id: eventId?.trim() ?? "",
  }
}