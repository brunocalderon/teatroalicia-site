import type { FormFieldControlProps } from "@/components/forms/fields/types"

export function SelectField({
  field,
  invalid,
  describedBy,
  onValueChange,
}: FormFieldControlProps) {
  return (
    <select
      id={`field-${field.name}`}
      name={field.name}
      className="formgong-input formgong-select"
      required={field.required}
      defaultValue=""
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={onValueChange}
    >
      <option value="" disabled>
        {field.placeholder ?? "Select…"}
      </option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
