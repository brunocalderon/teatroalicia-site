import type { FormFieldControlProps } from "@/components/forms/fields/types"
import type { FormFieldType } from "@/lib/form-schema"

type TextLikeFieldProps = FormFieldControlProps & {
  inputType: Exclude<
    FormFieldType,
    "textarea" | "select" | "radio" | "checkbox" | "file" | "instagram" | "date" | "tel"
  >
}

export function TextLikeField({
  field,
  inputType,
  invalid,
  describedBy,
  defaultValue,
  onValueChange,
  onBlurValidate,
}: TextLikeFieldProps) {
  return (
    <input
      id={`field-${field.name}`}
      name={field.name}
      type={inputType}
      className="formgong-input"
      required={field.required}
      placeholder={field.placeholder}
      defaultValue={defaultValue}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onInput={onValueChange}
      onBlur={(event) => {
        onBlurValidate?.(event.currentTarget.value)
      }}
    />
  )
}
