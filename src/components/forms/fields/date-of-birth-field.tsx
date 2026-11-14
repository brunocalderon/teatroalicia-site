import { useId, useRef, useState } from "react"
import { es } from "react-day-picker/locale"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  formatBirthdayDisplay,
  formatBirthdayIso,
} from "@/lib/form-fields/birthday"

const BIRTHDAY_START_YEAR = 1920

type DateOfBirthFieldProps = FormFieldControlProps & {
  lang: string
}

function birthdaySelectLabel(lang: string): string {
  return lang === "es" ? "Seleccionar fecha" : "Select date"
}

export function DateOfBirthField({
  field,
  lang,
  invalid,
  describedBy,
  onValueChange,
}: DateOfBirthFieldProps) {
  const fieldId = `field-${field.name}`
  const listboxId = useId()
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const today = new Date()
  const endYear = today.getFullYear()

  const syncHiddenValue = (next: Date | undefined) => {
    const hidden = hiddenRef.current
    if (!hidden) {
      return
    }
    hidden.value = next ? formatBirthdayIso(next) : ""
    onValueChange?.()
  }

  return (
    <div className="flex w-full flex-col">
      <input
        ref={hiddenRef}
        type="text"
        className="sr-only"
        tabIndex={-1}
        name={field.name}
        aria-hidden="true"
        defaultValue=""
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              id={fieldId}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={listboxId}
              data-empty={!date}
              className="formgong-date-trigger border-border/80 bg-background shadow-none"
            />
          }
        >
          {date ? formatBirthdayDisplay(date, lang) : birthdaySelectLabel(lang)}
        </PopoverTrigger>
        <PopoverContent
          id={listboxId}
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date ?? new Date(endYear - 25, 0, 1)}
            captionLayout="dropdown"
            startMonth={new Date(BIRTHDAY_START_YEAR, 0)}
            endMonth={today}
            locale={lang === "es" ? es : undefined}
            disabled={{ after: today }}
            onSelect={(selected) => {
              setDate(selected)
              syncHiddenValue(selected)
              if (selected) {
                setOpen(false)
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}