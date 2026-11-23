/**
 * Formgong metadata for Airtable guest-list forms (outside the inert fieldset).
 * @see docs/astro-form-request-forms.md
 */
export function GuestPassFormgongFields({
  provider,
  supplierEventId,
  guestPassTicketId,
}: {
  provider?: string
  supplierEventId?: string
  guestPassTicketId?: string
}) {
  const providerValue = provider?.trim() ?? ""
  const eventIdValue = supplierEventId?.trim() ?? ""
  const ticketIdValue = guestPassTicketId?.trim() ?? ""

  return (
    <>
      <input type="hidden" name="submit" value="true" />
      {providerValue ? (
        <input type="hidden" name="provider" value={providerValue} />
      ) : null}
      {eventIdValue ? (
        <input type="hidden" name="event_id" value={eventIdValue} />
      ) : null}
      {ticketIdValue ? (
        <input type="hidden" name="ticket_id" value={ticketIdValue} />
      ) : null}
    </>
  )
}