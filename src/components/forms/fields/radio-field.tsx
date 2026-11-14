import type { FormFieldControlProps } from "@/components/forms/fields/types"

export function RadioField({ field, onValueChange }: FormFieldControlProps) {
  return (
    <fieldset className="formgong-radio-group">
      {field.options?.map((option) => (
        <label key={option.value} className="formgong-choice">
          <input
            type="radio"
            name={field.name}
            value={option.value}
            required={field.required}
            onChange={onValueChange}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
