import { getFieldDefinition } from "@/components/forms/fields/registry"
import { validateFieldValue } from "@/components/forms/fields/values"
import { referralFieldLabel } from "@/lib/form-fields/referral"
import type { FormField, FormFieldType } from "@/lib/form-schema"

function fieldSpansFullWidth(type: FormFieldType): boolean {
  switch (type) {
    case "checkbox":
    case "textarea":
    case "file":
      return true
    default:
      return false
  }
}

function formFieldClassName(type: FormFieldType): string {
  const base = fieldSpansFullWidth(type)
    ? "form-field form-field--full"
    : "form-field"
  return type === "referral" ? `${base} form-field--referral` : base
}

function fieldErrorElementId(name: string): string {
  return `field-${name}-error`
}

function FormFieldErrorSlot({
  fieldName,
  error,
}: {
  fieldName: string
  error?: string
}) {
  if (!error) {
    return null
  }

  const errorElementId = fieldErrorElementId(fieldName)
  return (
    <div className="form-field-error-slot">
      <p id={errorElementId} className="form-field-error" role="alert">
        {error}
      </p>
    </div>
  )
}

type ComposableFormFieldProps = {
  field: FormField
  lang: string
  error?: string
  defaultValue?: string
  referralPromoter?: { id: string; name: string }
  referralPromoterPending?: boolean
  onClearError: (name: string) => void
  onSetFieldError: (name: string, message: string) => void
}

export function ComposableFormField({
  field,
  lang,
  error,
  defaultValue,
  referralPromoter,
  referralPromoterPending,
  onClearError,
  onSetFieldError,
}: ComposableFormFieldProps) {
  const def = getFieldDefinition(field.type)
  const Control = def.Control
  const errorId = error ? fieldErrorElementId(field.name) : undefined
  const onValueChange = () => {
    if (error) {
      onClearError(field.name)
    }
  }
  const labelText =
    field.type === "referral"
      ? referralFieldLabel(lang, field.label)
      : field.label

  const onBlurValidate = def.validate
    ? (value: string) => {
        if (!value.trim()) {
          if (error) {
            onClearError(field.name)
          }
          return
        }
        const message = validateFieldValue(field, lang, value)
        if (message) {
          onSetFieldError(field.name, message)
        } else if (error) {
          onClearError(field.name)
        }
      }
    : undefined

  if (def.wrapsOwnLabel) {
    return (
      <div className={formFieldClassName(field.type)}>
        <Control
          field={field}
          lang={lang}
          defaultValue={defaultValue}
          referralPromoter={referralPromoter}
          referralPromoterPending={referralPromoterPending}
          onValueChange={onValueChange}
          onBlurValidate={onBlurValidate}
        />
        <FormFieldErrorSlot fieldName={field.name} error={error} />
      </div>
    )
  }

  return (
    <div className={formFieldClassName(field.type)}>
      <label className="form-label" htmlFor={`field-${field.name}`}>
        {labelText}
        {field.required ? (
          <span className="form-required" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <Control
        field={field}
        lang={lang}
        invalid={Boolean(error)}
        describedBy={errorId}
        defaultValue={defaultValue}
        referralPromoter={referralPromoter}
        referralPromoterPending={referralPromoterPending}
        onValueChange={onValueChange}
        onBlurValidate={onBlurValidate}
      />
      <FormFieldErrorSlot fieldName={field.name} error={error} />
    </div>
  )
}
