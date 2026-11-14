import { CLOUDFLARE_TURNSTILE_SITE_KEY } from "astro:env/client"
import { ArrowRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { ComposableFormField } from "@/components/forms/fields/composable-form-field"
import {
  normalizeConfiguredFields,
  validateConfiguredFields,
} from "@/components/forms/fields/values"
import { FormgongHiddenFields } from "@/components/forms/formgong-hidden-fields"
import {
  TURNSTILE_ENABLED,
  TurnstileField,
} from "@/components/forms/turnstile-field"
import { formgongCopy } from "@/lib/formgong-copy"
import type { FormField, FormMessages } from "@/lib/form-schema"
import { defaultNameFields } from "@/lib/form-schema"
import {
  FORMGONG_SUBMIT_ACTION,
  getTurnstileResponseFromForm,
  postFormgongForm,
  resetTurnstileInForm,
} from "@/lib/formgong-submit"
import {
  formFieldUrlPrefill,
  visibleFormFields,
} from "@/lib/form-field-visibility"
import { ReferralAttributionFields } from "@/components/forms/referral-attribution-fields"
import {
  applyReferralAttributionToForm,
  findReferralFormField,
  getReferralAttributionFromSearchParams,
} from "@/lib/referral-attribution"
import { resolveGuestPassReferralFromSearchParams } from "@/lib/promoters"
import {
  buildThankYouRedirectUrl,
  normalizeFormNameFields,
} from "@/lib/formgong-thank-you"

import "@/styles/formgong.css"
import "@/styles/global.css"

const turnstileSiteKey = CLOUDFLARE_TURNSTILE_SITE_KEY.trim()

export type ConfigurableFormProps = {
  token: string
  fields: FormField[]
  lang: string
  submitLabel: string
  thankYouPath: string
  nameFields?: string[]
  messages?: FormMessages
}

function mergeMessages(messages?: FormMessages) {
  return {
    submit: messages?.submit ?? "Submit",
    sending: messages?.sending ?? "Sending…",
    formNotConfigured:
      messages?.formNotConfigured ?? formgongCopy.errors.formNotConfigured,
    turnstileRequired:
      messages?.turnstileRequired ?? formgongCopy.errors.turnstileRequired,
    connectionFailed:
      messages?.connectionFailed ?? formgongCopy.errors.connectionFailed,
  }
}

export function ConfigurableForm({
  token,
  fields,
  lang,
  submitLabel,
  thankYouPath,
  nameFields: nameFieldsProp,
  messages: messagesProp,
}: ConfigurableFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [formgongError, setFormgongError] = useState<string | null>(null)
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

  const urlSearchParams = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams()
    }
    return new URLSearchParams(window.location.search)
  }, [])

  const referralPromoter = useMemo(
    () => resolveGuestPassReferralFromSearchParams(urlSearchParams),
    [urlSearchParams]
  )

  const referralAttribution = useMemo(
    () => getReferralAttributionFromSearchParams(urlSearchParams, fields),
    [urlSearchParams, fields]
  )

  const referralVisibilityContext = useMemo(
    () => ({ referralPromoter }),
    [referralPromoter]
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
          referralPromoter: resolveGuestPassReferralFromSearchParams(submitParams),
        }),
        lang
      )
      if (Object.keys(validationErrors).length > 0) {
        event.preventDefault()
        setFieldErrors(validationErrors)
        return
      }

      if (!TURNSTILE_ENABLED) {
        return
      }

      if (!turnstileSiteKey) {
        event.preventDefault()
        setConfigError(formgongCopy.turnstile.siteKeyMissing)
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
      setFormgongError(null)
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
            const res = await postFormgongForm(currentForm, {
              accessKey,
              beforePost: (target) => {
                const postParams = new URLSearchParams(window.location.search)
                applyReferralAttributionToForm(target, fields, postParams)
                normalizeConfiguredFields(
                  target,
                  visibleFormFields(fields, postParams, {
                    referralPromoter:
                      resolveGuestPassReferralFromSearchParams(postParams),
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
                  thankYouField
                )
              )
              return
            }
            setFormgongError(res?.message ?? copy.connectionFailed)
          } catch {
            setFormgongError(copy.connectionFailed)
          } finally {
            if (!navigated) {
              currentForm.removeAttribute("aria-busy")
              setIsSubmitting(false)
              if (TURNSTILE_ENABLED && turnstileSiteKey) {
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
  }, [accessKey, copy.connectionFailed, fields, nameFields, thankYouPath])

  return (
    <form
      ref={formRef}
      id={accessKey ? `fg-${accessKey}` : undefined}
      className="formgong-form"
      action={FORMGONG_SUBMIT_ACTION}
      method="POST"
    >
      <FormgongHiddenFields accessKey={accessKey} lang={lang} />
      {referralAttribution ? (
        <ReferralAttributionFields
          referralFieldName={
            findReferralFormField(fields)?.name ?? "referral_id"
          }
          attribution={referralAttribution}
        />
      ) : null}

      <fieldset className="formgong-fieldset" inert={isSubmitting}>
        {visibleFields.map((field) => (
          <ComposableFormField
            key={field.name}
            field={field}
            lang={lang}
            defaultValue={formFieldUrlPrefill(field, urlSearchParams)}
            referralPromoter={
              field.type === "referral" ? referralPromoter ?? undefined : undefined
            }
            error={fieldErrors[field.name]}
            onClearError={clearFieldError}
            onSetFieldError={setFieldError}
          />
        ))}

        <TurnstileField />

        {(configError ?? formgongError) ? (
          <p className="formgong-alert" role="alert">
            {configError ?? formgongError}
          </p>
        ) : null}

        <button
          type="submit"
          className="formgong-submit"
          disabled={!accessKey}
        >
          <span className="formgong-submit__inner">
            <span className="formgong-submit__label">
              {isSubmitting ? copy.sending : displaySubmitLabel}
            </span>
            <ArrowRight
              className="formgong-submit__icon"
              aria-hidden="true"
              strokeWidth={2}
            />
          </span>
        </button>
      </fieldset>
    </form>
  )
}
