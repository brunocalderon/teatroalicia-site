import "@/styles/formgong.css"

/**
 * Required Formgong fields — see docs/astro-formgong-request-forms.md
 */
export function FormgongHiddenFields({
  accessKey,
  lang = "en",
  eventId,
}: {
  accessKey: string
  lang?: string
  eventId?: string
}) {
  const eventIdValue = eventId?.trim() ?? ""
  return (
    <>
      <input type="hidden" name="access_key" value={accessKey} />
      <input type="hidden" name="_lang" value={lang} />
      {eventIdValue ? (
        <input type="hidden" name="eventId" value={eventIdValue} />
      ) : null}
      <div aria-hidden className="formgong-honeypot">
        {/*
          Chrome maps email + nearby text inputs to saved passwords. A nameless
          decoy absorbs that autofill without posting to Formgong.
        */}
        <input type="password" tabIndex={-1} autoComplete="new-password" />
        <label>
          Leave this field empty
          <input
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
    </>
  )
}
