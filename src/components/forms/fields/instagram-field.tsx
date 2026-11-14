import type { FormEvent, FocusEvent } from "react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import { instagramFieldAutoComplete } from "@/lib/form-field-autocomplete"
import { parseInstagramUsername } from "@/lib/form-fields/instagram"

function commitNormalizedValue(
  input: HTMLInputElement,
  onValueChange?: () => void
): void {
  const cleaned = parseInstagramUsername(input.value)
  if (cleaned !== input.value) {
    input.value = cleaned
    onValueChange?.()
  }
}

export function InstagramField({
  field,
  invalid,
  describedBy,
  onValueChange,
}: FormFieldControlProps) {
  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const before = input.value
    commitNormalizedValue(input, onValueChange)
    if (input.value === before) {
      onValueChange?.()
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commitNormalizedValue(event.currentTarget, onValueChange)
  }

  return (
    <input
      id={`field-${field.name}`}
      name={field.name}
      type="text"
      className="formgong-input"
      required={field.required}
      placeholder={field.placeholder}
      autoComplete={instagramFieldAutoComplete}
      spellCheck={false}
      data-1p-ignore
      data-lpignore="true"
      data-form-type="other"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onInput={handleInput}
      onBlur={handleBlur}
    />
  )
}
