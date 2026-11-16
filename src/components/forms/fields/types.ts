import type { ComponentType } from "react"

import type { FormField } from "@/lib/form-schema"

export type FieldValidationContext = {
  lang: string
  field: FormField
  value: string
}

export type FormFieldControlProps = {
  field: FormField
  lang: string
  invalid?: boolean
  describedBy?: string
  defaultValue?: string
  referralPromoter?: { id: string; name: string }
  referralPromoterPending?: boolean
  onValueChange?: () => void
  onBlurValidate?: (value: string) => void
}

export type FormFieldDefinition = {
  Control: ComponentType<FormFieldControlProps>
  /** When true, the control renders its own visible label (e.g. checkbox). */
  wrapsOwnLabel?: boolean
  validate?: (ctx: FieldValidationContext) => string | null
  normalize?: (value: string) => string
}
