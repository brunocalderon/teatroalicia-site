import type { FormFieldControlProps } from "@/components/forms/fields/types"

export function FileField({
  field,
  invalid,
  describedBy,
  onValueChange,
}: FormFieldControlProps) {
  return (
    <input
      id={`field-${field.name}`}
      name={field.name}
      type="file"
      className="form-input form-file"
      required={field.required}
      accept={field.accept}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={onValueChange}
    />
  )
}
