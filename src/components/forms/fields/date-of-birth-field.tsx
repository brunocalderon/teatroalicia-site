import { useEffect, useRef, useState, type RefObject } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)
  const skipSegmentClearOnFocusRef = useRef(false)

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

  function focusBirthdaySegment(ref: RefObject<HTMLInputElement | null>) {
    skipSegmentClearOnFocusRef.current = true
    ref.current?.focus()
    queueMicrotask(() => {
      skipSegmentClearOnFocusRef.current = false
    })
  }

  function clearSegmentOnUserFocus(key: keyof BirthdayParts) {
    if (skipSegmentClearOnFocusRef.current) {
      return
    }
    setParts((current) => {
      if (current[key] === "") {
        return current
      }
      return { ...current, [key]: "" }
    })
  }

  function updatePart<K extends keyof BirthdayParts>(
    key: K,
    value: BirthdayParts[K],
    options?: { nextFocus?: "month" | "year" }
  ) {
    setParts((current) => ({ ...current, [key]: value }))
    if (options?.nextFocus === "month" && value.length === 2 && value !== "00") {
      queueMicrotask(() => focusBirthdaySegment(monthRef))
    }
    if (options?.nextFocus === "year" && value.length === 2 && value !== "00") {
      queueMicrotask(() => focusBirthdaySegment(yearRef))
    }
  }

  function scheduleBirthdayLeaveSideEffects() {
    const container = containerRef.current
    if (!container) {
      return
    }

    window.requestAnimationFrame(() => {
      if (container.contains(document.activeElement)) {
        return
      }

      setParts((current) => {
        const next = {
          ...current,
          day: padBirthdayDayMonthSegment(current.day),
          month: padBirthdayDayMonthSegment(current.month),
        }
        queueMicrotask(() => {
          onBlurValidate?.(resolveBirthdaySubmitValue(next))
        })
        return next
      })
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget
      if (next instanceof Node && container.contains(next)) {
        return
      }
      scheduleBirthdayLeaveSideEffects()
    }

    container.addEventListener("focusout", onFocusOut)
    return () => container.removeEventListener("focusout", onFocusOut)
  })

  return (
    <div
      ref={containerRef}
      className={
        invalid
          ? "form-birthday form-birthday--invalid"
          : "form-birthday"
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
        className="form-input form-birthday__segment form-birthday__day"
        placeholder={placeholders.day}
        aria-label={ariaLabels.day}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.day}
        maxLength={2}
        onFocus={() => clearSegmentOnUserFocus("day")}
        onChange={(event) => {
          const next = normalizeBirthdayDayInput(event.target.value)
          updatePart("day", next, { nextFocus: "month" })
        }}
      />
      <span className="form-birthday__separator" aria-hidden>
        /
      </span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        autoComplete="bday-month"
        className="form-input form-birthday__segment form-birthday__month"
        placeholder={placeholders.month}
        aria-label={ariaLabels.month}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.month}
        maxLength={2}
        onFocus={() => clearSegmentOnUserFocus("month")}
        onChange={(event) => {
          const next = normalizeBirthdayMonthInput(event.target.value)
          updatePart("month", next, { nextFocus: "year" })
        }}
      />
      <span className="form-birthday__separator" aria-hidden>
        /
      </span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        autoComplete="bday-year"
        className="form-input form-birthday__segment form-birthday__year"
        placeholder={placeholders.year}
        aria-label={ariaLabels.year}
        required={field.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={parts.year}
        maxLength={4}
        onFocus={() => clearSegmentOnUserFocus("year")}
        onChange={(event) => {
          updatePart("year", normalizeBirthdayYearInput(event.target.value))
        }}
      />
    </div>
  )
}