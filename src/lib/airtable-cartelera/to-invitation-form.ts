import { guestListFormEs } from "../../../content/i18n/guest-list-form.es"
import { parseAirtableInvitationFormFields } from "@/lib/airtable-cartelera/parse-invitation-fields"
import { resolveAirtableCarteleraEventKind } from "@/lib/airtable-cartelera/resolve-event-kind"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import type { FormEntryData } from "@/lib/form-schema"

export function defaultAirtableInvitationPath(slug: string): string {
  return `/i/${slug}`
}

export function airtableRowToInvitationFormData(
  row: AirtableCarteleraRow,
  options: { formToken: string },
): FormEntryData {
  const path = defaultAirtableInvitationPath(row.slug)

  return {
    title: row.title,
    description: row.title,
    path,
    thankYouPath: `${path}/gracias`,
    eventId: row.eventId,
    eventStart: row.eventStart,
    eventEnd: row.eventEnd,
    eventKind: resolveAirtableCarteleraEventKind(row.eventKind),
    ticketUrl: row.ticketUrl,
    ticketLink: row.ticketUrl,
    ticketSupplier: row.ticketSupplier,
    supplierEventId: row.supplierEventId,
    guestPassTicketId: row.guestPassTicketId,
    invitationOnly: true,
    organizerIsVenue: false,
    livestackFooter: true,
    thankYouInstagram: true,
    token: options.formToken,
    lang: guestListFormEs.lang,
    submitLabel: guestListFormEs.submitLabel,
    imageAlt: row.imageAlt ?? row.title,
    messages: {
      submit: guestListFormEs.messages.submit,
      sending: guestListFormEs.messages.sending,
      turnstileRequired: guestListFormEs.messages.turnstileRequired,
      connectionFailed: guestListFormEs.messages.connectionFailed,
      formBody: guestListFormEs.formIntroMarkdown,
      thankYouBody: guestListFormEs.thankYouMarkdown,
    },
    fields: parseAirtableInvitationFormFields(row.guestListFieldsRaw),
  }
}