import type { FormFieldControlProps } from "@/components/forms/fields/types"

export function CheckboxField({ field, onValueChange }: FormFieldControlProps) {
  return (
    <label className="form-choice">
      <input
        type="checkbox"
        name={field.name}
        required={field.required}
        value="yes"
        onChange={onValueChange}
      />
      <span>{field.label}</span>
    </label>
  )
}
