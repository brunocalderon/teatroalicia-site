import "@/styles/formgong.css"

/**
 * Required Formgong fields — see docs/astro-formgong-request-forms.md
 */
export function FormgongHiddenFields({
  accessKey,
  lang = "en",
}: {
  accessKey: string
  lang?: string
}) {
  return (
    <>
      <input type="hidden" name="access_key" value={accessKey} />
      <input type="hidden" name="_lang" value={lang} />
      <div aria-hidden className="formgong-honeypot">
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
