import type { FormFieldControlProps } from "@/components/forms/fields/types"

export function TextareaField({
  field,
  invalid,
  describedBy,
  onValueChange,
}: FormFieldControlProps) {
  return (
    <textarea
      id={`field-${field.name}`}
      name={field.name}
      className="form-input form-textarea"
      rows={5}
      required={field.required}
      placeholder={field.placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onInput={onValueChange}
    />
  )
}
