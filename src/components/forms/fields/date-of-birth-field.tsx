import { useEffect, useRef, useState } from "react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import {
  birthdaySegmentAriaLabels,
  birthdaySegmentPlaceholders,
  normalizeBirthdayDayInput,
  normalizeBirthdayMonthInput,
  normalizeBirthdayYearInput,
  padBirthdayDayMonthSegment,
  resolveBirthdaySubmitValue,
  splitBirthdayFieldValue,
  type BirthdayParts,
} from "@/lib/form-fields/birthday"

type DateOfBirthFieldProps = FormFieldControlProps & {
  lang: string
}

export function DateOfBirthField({
  field,
  lang,
  invalid,
  describedBy,
  defaultValue,
  onValueChange,
  onBlurValidate,
}: DateOfBirthFieldProps) {
  const [parts, setParts] = useState<BirthdayParts>(() =>
    splitBirthdayFieldValue(defaultValue ?? "")
  )
  const hiddenRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  const placeholders = birthdaySegmentPlaceholders(lang)
  const ariaLabels = birthdaySegmentAriaLabels(lang)
  const fieldId = `field-${field.name}`
  const submitValue = resolveBirthdaySubmitValue(parts)

  const syncHiddenValue = (value: string) => {
    const hidden = hiddenRef.current
    if (!hidden) {
      return
    }
    hidden.value = value
    onValueChange?.()
  }

  useEffect(() => {
    syncHiddenValue(submitValue)
  }, [submitValue])

  function updatePart<K extends keyof BirthdayParts>(
    key: K,
    value: BirthdayParts[K],
    options?: { nextFocus?: "month" | "year" }
  ) {
    setParts((current) => ({ ...current, [key]: value }))
    if (options?.nextFocus === "month" && value.length === 2) {
      monthRef.current?.focus()
    }
    if (options?.nextFocus === "year" && value.length === 2) {
      yearRef.current?.focus()
    }
  }

  function handleBlurValidate() {
    onBlurValidate?.(hiddenRef.current?.value ?? "")
  }

  return (
    <div
      className={
        invalid
          ? "formgong-birthday formgong-birthday--invalid"
          : "formgong-birthday"
      }
    >
      <input
        ref={hiddenRef}
        type="text"
        className="sr-only"
        tabIndex={-1}
        name={field.name}
        defaultValue=""
        aria-hidden="true"
      />
      <input
        id={fieldId}
        type="text"
        inputMode="numeric"
        autoComplete="bday-day"
        className="formgong-input formgong-birthday__segment formgong-birthday__day"
        placeholder={placeholders.day}
        aria-label={ariaLabels.day}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.day}
        maxLength={2}
        onChange={(event) => {
          const next = normalizeBirthdayDayInput(event.target.value)
          updatePart("day", next, { nextFocus: "month" })
        }}
        onBlur={() => {
          const padded = padBirthdayDayMonthSegment(parts.day)
          if (padded !== parts.day) {
            setParts((current) => ({ ...current, day: padded }))
          }
          handleBlurValidate()
        }}
      />
      <span className="formgong-birthday__separator" aria-hidden>
        /
      </span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        autoComplete="bday-month"
        className="formgong-input formgong-birthday__segment formgong-birthday__month"
        placeholder={placeholders.month}
        aria-label={ariaLabels.month}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.month}
        maxLength={2}
        onChange={(event) => {
          const next = normalizeBirthdayMonthInput(event.target.value)
          updatePart("month", next, { nextFocus: "year" })
        }}
        onBlur={() => {
          const padded = padBirthdayDayMonthSegment(parts.month)
          if (padded !== parts.month) {
            setParts((current) => ({ ...current, month: padded }))
          }
          handleBlurValidate()
        }}
      />
      <span className="formgong-birthday__separator" aria-hidden>
        /
      </span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        autoComplete="bday-year"
        className="formgong-input formgong-birthday__segment formgong-birthday__year"
        placeholder={placeholders.year}
        aria-label={ariaLabels.year}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.year}
        maxLength={4}
        onChange={(event) => {
          updatePart("year", normalizeBirthdayYearInput(event.target.value))
        }}
        onBlur={handleBlurValidate}
      />
    </div>
  )
}