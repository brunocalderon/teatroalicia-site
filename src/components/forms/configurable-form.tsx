import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { FormFomoToasts } from "@/components/forms/form-fomo-toasts"
import { ComposableFormField } from "@/components/forms/fields/composable-form-field"
import {
  normalizeConfiguredFields,
  validateConfiguredFields,
} from "@/components/forms/fields/values"
import { FormHiddenFields } from "@/components/forms/form-hidden-fields"
import {
  TURNSTILE_ENABLED,
  TurnstileField,
} from "@/components/forms/turnstile-field"
import { formCopy } from "@/lib/form-copy"
import { defaultNameFields } from "@/lib/form-name-fields"
import type { FormField, FormMessages } from "@/lib/form-schema"
import {
  FORM_SUBMIT_ACTION,
  getTurnstileResponseFromForm,
  postForm,
  resetTurnstileInForm,
} from "@/lib/form-submit"
import {
  formFieldUrlPrefill,
  guestPassReferralRowVisible,
  trimmedUrlParam,
  visibleFormFields,
} from "@/lib/form-field-visibility"
import { ReferralAttributionFields } from "@/components/forms/referral-attribution-fields"
import {
  applyReferralAttributionToForm,
  findReferralFormField,
  getReferralAttributionFromSearchParams,
} from "@/lib/referral-attribution"
import { persistGuestPassAttributionForAnalytics } from "@/lib/guest-pass-attribution-storage"
import {
  promoterRefQueryParam,
  displayGuestPassReferralFromSearchParams,
} from "@/lib/promoters"
import type { MarketingPageTracking } from "@/lib/marketing-page-tracking"

import "@/styles/form.css"
import "@/styles/global.css"

export type ConfigurableFormProps = {
  token: string
  fields: FormField[]
  lang: string
  submitLabel: string
  thankYouPath: string
  eventId?: string
  nameFields?: string[]
  messages?: FormMessages
  marketingTracking?: MarketingPageTracking
}

function mergeMessages(messages?: FormMessages) {
  return {
    submit: messages?.submit ?? "Submit",
    sending: messages?.sending ?? "Sending…",
    formNotConfigured:
      messages?.formNotConfigured ?? formCopy.errors.formNotConfigured,
    turnstileRequired:
      messages?.turnstileRequired ?? formCopy.errors.turnstileRequired,
    connectionFailed:
      messages?.connectionFailed ?? formCopy.errors.connectionFailed,
  }
}

export function ConfigurableForm({
  token,
  fields,
  lang,
  submitLabel,
  thankYouPath,
  eventId,
  nameFields: nameFieldsProp,
  messages: messagesProp,
  marketingTracking,
}: ConfigurableFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [formNode, setFormNode] = useState<HTMLFormElement | null>(null)
  const bindFormRef = useCallback((node: HTMLFormElement | null) => {
    formRef.current = node
    setFormNode(node)
  }, [])
  const [configError, setConfigError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>(
    {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accessKey = token.trim()
  const nameFields = useMemo(
    () =>
      nameFieldsProp && nameFieldsProp.length > 0
        ? nameFieldsProp
        : defaultNameFields(fields),
    [fields, nameFieldsProp]
  )
  const copy = useMemo(() => mergeMessages(messagesProp), [messagesProp])
  const displaySubmitLabel = submitLabel.trim() || copy.submit

  const [urlSearchParams, setUrlSearchParams] = useState(
    () => new URLSearchParams()
  )

  useEffect(() => {
    const next = new URLSearchParams(window.location.search)
    setUrlSearchParams((current) =>
      current.toString() === next.toString() ? current : next
    )
  }, [])

  const hasReferralField = useMemo(
    () => fields.some((field) => field.type === "referral"),
    [fields],
  )

  const guestPassRef = trimmedUrlParam(urlSearchParams, promoterRefQueryParam)

  const showGuestPassReferralRow =
    hasReferralField && guestPassRef.length > 0

  const referralPromoter = useMemo(() => {
    if (!showGuestPassReferralRow) {
      return undefined
    }
    return displayGuestPassReferralFromSearchParams(urlSearchParams)
  }, [showGuestPassReferralRow, urlSearchParams])

  const referralPromoterPending = false

  const referralAttribution = useMemo(
    () => getReferralAttributionFromSearchParams(urlSearchParams, fields),
    [urlSearchParams, fields]
  )

  useEffect(() => {
    if (!referralAttribution) {
      return
    }
    persistGuestPassAttributionForAnalytics(urlSearchParams, referralAttribution)
  }, [referralAttribution, urlSearchParams])

  const referralVisibilityContext = useMemo(
    () => ({ showGuestPassReferralRow, referralPromoterPending }),
    [showGuestPassReferralRow, referralPromoterPending],
  )

  const visibleFields = useMemo(
    () => visibleFormFields(fields, urlSearchParams, referralVisibilityContext),
    [fields, urlSearchParams, referralVisibilityContext]
  )

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev
      }
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const setFieldError = useCallback((name: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  useEffect(() => {
    const form = formRef.current
    if (!form) {
      return
    }

    function handleSubmitCapture(event: Event) {
      const activeForm = formRef.current
      if (!activeForm) {
        return
      }

      setConfigError(null)
      setFieldErrors({})

      if (!accessKey) {
        event.preventDefault()
        setConfigError(copy.formNotConfigured)
        return
      }

      const submitParams = new URLSearchParams(window.location.search)
      const validationErrors = validateConfiguredFields(
        activeForm,
        visibleFormFields(fields, submitParams, {
          showGuestPassReferralRow: guestPassReferralRowVisible(
            fields,
            submitParams,
          ),
        }),
        lang
      )
      if (Object.keys(validationErrors).length > 0) {
        event.preventDefault()
        setFieldErrors(validationErrors)
        return
      }

      if (!TURNSTILE_ENABLED) {
        if (import.meta.env.PROD) {
          event.preventDefault()
          setConfigError(formCopy.turnstile.siteKeyMissing)
        }
        return
      }

      if (!getTurnstileResponseFromForm(activeForm)) {
        event.preventDefault()
        setConfigError(copy.turnstileRequired)
      }
    }

    form.addEventListener("submit", handleSubmitCapture, { capture: true })
    return () => {
      form.removeEventListener("submit", handleSubmitCapture, { capture: true })
    }
  }, [accessKey, copy, fields, lang, visibleFields])

  useEffect(() => {
    const form = formRef.current
    if (!form) {
      return
    }

    function handleSubmitBubble(event: Event) {
      if (event.defaultPrevented) {
        return
      }
      const activeForm = formRef.current
      if (!activeForm) {
        return
      }
      event.preventDefault()
      setFormError(null)
      setIsSubmitting(true)
      activeForm.setAttribute("aria-busy", "true")

      queueMicrotask(() => {
        void (async () => {
          let navigated = false
          const currentForm = formRef.current
          if (!currentForm) {
            setIsSubmitting(false)
            return
          }
          try {
            const submitImports = Promise.all([
              import("@/lib/form-thank-you"),
              marketingTracking
                ? Promise.all([
                    import("@/lib/marketing-page-tracking"),
                    import("@/lib/meta-pixel-user-data"),
                  ])
                : Promise.resolve(null),
            ] as const)
            const [{ normalizeFormNameFields, buildThankYouRedirectUrl }, marketingModules] =
              await submitImports
            if (marketingTracking && marketingModules) {
              const [{ trackMetaLead }, { buildMetaPixelUserDataFromForm }] =
                marketingModules
              trackMetaLead(
                marketingTracking,
                buildMetaPixelUserDataFromForm(currentForm, fields, {
                  nameFields,
                  city: marketingTracking.city,
                })
              )
            }
            const res = await postForm(currentForm, {
              accessKey,
              beforePost: (target) => {
                const postParams = new URLSearchParams(window.location.search)
                applyReferralAttributionToForm(target, fields, postParams)
                normalizeConfiguredFields(
                  target,
                  visibleFormFields(fields, postParams, {
                    showGuestPassReferralRow: guestPassReferralRowVisible(
                      fields,
                      postParams,
                    ),
                  })
                )
                if (nameFields.length > 0) {
                  normalizeFormNameFields(target, nameFields)
                }
              },
            })
            if (res?.success) {
              navigated = true
              const thankYouField = nameFields[0] ?? "firstName"
              window.location.assign(
                buildThankYouRedirectUrl(
                  thankYouPath,
                  window.location.origin,
                  currentForm,
                  thankYouField,
                  new URLSearchParams(window.location.search)
                )
              )
              return
            }
            setFormError(res?.message ?? copy.connectionFailed)
          } catch {
            setFormError(copy.connectionFailed)
          } finally {
            if (!navigated) {
              currentForm.removeAttribute("aria-busy")
              setIsSubmitting(false)
              if (TURNSTILE_ENABLED) {
                resetTurnstileInForm(currentForm)
              }
            }
          }
        })()
      })
    }

    form.addEventListener("submit", handleSubmitBubble)
    return () => {
      form.removeEventListener("submit", handleSubmitBubble)
    }
  }, [
    accessKey,
    copy.connectionFailed,
    fields,
    marketingTracking,
    nameFields,
    thankYouPath,
  ])

  const fomoToastsEnabled = lang === "es"

  return (
    <>
      <FormFomoToasts enabled={fomoToastsEnabled} form={formNode} />
      <form
        ref={bindFormRef}
        id={accessKey ? `fg-${accessKey}` : undefined}
        className="form-form"
        action={FORM_SUBMIT_ACTION}
        method="POST"
      >
      <FormHiddenFields
        accessKey={accessKey}
        lang={lang}
        eventId={eventId}
      />
      {referralAttribution ? (
        <ReferralAttributionFields
          referralFieldName={
            findReferralFormField(fields)?.name ?? "referral_id"
          }
          attribution={referralAttribution}
        />
      ) : null}

      <fieldset className="form-fieldset" inert={isSubmitting}>
        {visibleFields.map((field) => (
          <ComposableFormField
            key={field.name}
            field={field}
            lang={lang}
            defaultValue={formFieldUrlPrefill(field, urlSearchParams)}
            referralPromoter={
              field.type === "referral" ? referralPromoter ?? undefined : undefined
            }
            referralPromoterPending={
              field.type === "referral" ? referralPromoterPending : undefined
            }
            error={fieldErrors[field.name]}
            onClearError={clearFieldError}
            onSetFieldError={setFieldError}
          />
        ))}

        <TurnstileField />

        {(configError ?? formError) ? (
          <p className="form-alert" role="alert">
            {configError ?? formError}
          </p>
        ) : null}

        <button
          type="submit"
          className="form-submit"
          disabled={!accessKey}
        >
          <span className="form-submit__inner">
            <span className="form-submit__label">
              {isSubmitting ? copy.sending : displaySubmitLabel}
            </span>
            <svg
              className="form-submit__icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </fieldset>
    </form>
    </>
  )
}
