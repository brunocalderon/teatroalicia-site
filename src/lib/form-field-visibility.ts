import type { FormField } from "@/lib/form-schema"
import type { Promoter } from "@/lib/promoters"

export function trimmedUrlParam(
  params: URLSearchParams,
  key: string
): string {
  return params.get(key)?.trim() ?? ""
}

type FieldVisibilityContext = {
  referralPromoter?: Promoter | null
  referralPromoterPending?: boolean
}

export function isFormFieldVisible(
  field: FormField,
  params: URLSearchParams,
  context?: FieldVisibilityContext
): boolean {
  if (field.type === "referral") {
    return (
      Boolean(context?.referralPromoter) ||
      Boolean(context?.referralPromoterPending)
    )
  }

  const gate = field.visibleWhenUrlParam
  if (!gate) {
    return true
  }
  return trimmedUrlParam(params, gate).length > 0
}

/** Prefill from the same query param that controls visibility, when set. */
export function formFieldUrlPrefill(
  field: FormField,
  params: URLSearchParams
): string | undefined {
  const key = field.visibleWhenUrlParam
  if (!key) {
    return undefined
  }
  const value = trimmedUrlParam(params, key)
  return value || undefined
}

function orderReferralFieldsFirst(fields: FormField[]): FormField[] {
  const referralFields: FormField[] = []
  const otherFields: FormField[] = []

  for (const field of fields) {
    if (field.type === "referral") {
      referralFields.push(field)
    } else {
      otherFields.push(field)
    }
  }

  return [...referralFields, ...otherFields]
}

export function visibleFormFields(
  fields: readonly FormField[],
  params: URLSearchParams,
  context?: FieldVisibilityContext
): FormField[] {
  return orderReferralFieldsFirst(
    fields.filter((field) => isFormFieldVisible(field, params, context)),
  )
}