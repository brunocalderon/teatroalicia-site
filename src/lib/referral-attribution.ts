import { trimmedUrlParam } from "@/lib/form-field-visibility"
import type { FormField } from "@/lib/form-schema"
import {
  type Promoter,
  promoterRefQueryParam,
  resolveGuestPassReferral,
} from "@/lib/promoters"

export const referralEnabledFieldName = "referral_enabled"

export function findReferralFormField(
  fields: readonly FormField[]
): FormField | undefined {
  return fields.find((field) => field.type === "referral")
}

export type ReferralAttribution = {
  eParam: string
  promoter: Promoter | undefined
  verified: boolean
  referralValue: string
}

export function getReferralAttributionFromSearchParams(
  params: URLSearchParams,
  fields: readonly FormField[]
): ReferralAttribution | null {
  const referralField = findReferralFormField(fields)
  if (!referralField) {
    return null
  }
  const eParam = trimmedUrlParam(params, promoterRefQueryParam)
  if (!eParam) {
    return null
  }
  const promoter = resolveGuestPassReferral(eParam)
  return {
    eParam,
    promoter,
    verified: Boolean(promoter),
    referralValue: promoter?.id ?? eParam,
  }
}

export function setFormHiddenField(
  form: HTMLFormElement,
  name: string,
  value: string
): void {
  const escaped = CSS.escape(name)
  let input = form.querySelector<HTMLInputElement>(
    `input[type="hidden"][name="${escaped}"]`
  )
  if (!input) {
    input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    form.appendChild(input)
  }
  input.value = value
}

export function applyReferralAttributionToForm(
  form: HTMLFormElement,
  fields: readonly FormField[],
  params: URLSearchParams
): void {
  const referralField = findReferralFormField(fields)
  const attribution = getReferralAttributionFromSearchParams(params, fields)
  if (!referralField || !attribution) {
    return
  }
  setFormHiddenField(form, referralField.name, attribution.referralValue)
  setFormHiddenField(
    form,
    referralEnabledFieldName,
    attribution.verified ? "true" : "false"
  )
}