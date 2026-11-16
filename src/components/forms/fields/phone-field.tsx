import type { CountryCode } from "libphonenumber-js"
import { ChevronDown } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import {
  normalizePhoneNationalInput,
  parsePhoneToSubmitValue,
  phoneNationalPlaceholder,
  phoneSearchAriaLabel,
  phoneSearchPlaceholder,
} from "@/lib/form-fields/phone"
import {
  buildPhoneCountryOptions,
  DEFAULT_PHONE_COUNTRY_CODE,
  filterPhoneCountryOptions,
} from "@/lib/phone-countries"

export function PhoneField({
  field,
  lang,
  invalid,
  describedBy,
  onValueChange,
}: FormFieldControlProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [country, setCountry] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY_CODE)
  const [nationalNumber, setNationalNumber] = useState("")
  const [countryQuery, setCountryQuery] = useState("")
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [activeCountryIndex, setActiveCountryIndex] = useState(-1)

  const inputId = `field-${field.name}`
  const phoneCountryOptions = useMemo(
    () => buildPhoneCountryOptions(lang),
    [lang]
  )

  const selectedCountry = useMemo(
    () =>
      phoneCountryOptions.find((option) => option.code === country) ??
      phoneCountryOptions[0],
    [country, phoneCountryOptions]
  )

  const filteredCountries = useMemo(
    () => filterPhoneCountryOptions(countryQuery, phoneCountryOptions),
    [countryQuery, phoneCountryOptions]
  )

  const { submitValue } = useMemo(
    () => parsePhoneToSubmitValue(country, nationalNumber),
    [country, nationalNumber]
  )

  const numberPlaceholder = useMemo(
    () => field.placeholder ?? phoneNationalPlaceholder(country),
    [country, field.placeholder]
  )

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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsCountryOpen(false)
        setCountryQuery("")
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  function selectCountry(code: CountryCode) {
    setCountry(code)
    setIsCountryOpen(false)
    setCountryQuery("")
    setActiveCountryIndex(-1)
  }

  function handleNationalNumberBlur() {
    const normalized = normalizePhoneNationalInput(nationalNumber, country)
    if (normalized.country !== country) {
      setCountry(normalized.country)
    }
    if (
      normalized.nationalDisplay !== nationalNumber ||
      normalized.submitValue !== submitValue
    ) {
      setNationalNumber(normalized.nationalDisplay)
      syncHiddenValue(normalized.submitValue)
    }
  }

  function handleCountryKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isCountryOpen || filteredCountries.length === 0) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault()
        setIsCountryOpen(true)
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveCountryIndex((index) =>
          index + 1 >= filteredCountries.length ? 0 : index + 1
        )
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveCountryIndex((index) =>
          index <= 0 ? filteredCountries.length - 1 : index - 1
        )
        break
      case "Enter":
        if (activeCountryIndex >= 0) {
          event.preventDefault()
          selectCountry(filteredCountries[activeCountryIndex].code)
        }
        break
      case "Escape":
        setIsCountryOpen(false)
        setCountryQuery("")
        setActiveCountryIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className="form-phone">
      <input
        ref={hiddenRef}
        type="text"
        className="sr-only"
        tabIndex={-1}
        name={field.name}
        defaultValue=""
        aria-hidden="true"
      />
      <div
        className={
          invalid
            ? "form-phone__control form-phone__control--invalid"
            : "form-phone__control"
        }
      >
        <button
          type="button"
          className="form-phone__country"
          aria-expanded={isCountryOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          onClick={() => setIsCountryOpen((open) => !open)}
          onKeyDown={handleCountryKeyDown}
        >
          <span className="form-phone__flag" aria-hidden>
            {selectedCountry.flag}
          </span>
          <span className="form-phone__dial-code">{selectedCountry.callingCode}</span>
          <ChevronDown className="form-phone__chevron" aria-hidden />
        </button>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className="form-phone__number"
          placeholder={numberPlaceholder}
          required={field.required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          value={nationalNumber}
          onChange={(event) => {
            setNationalNumber(event.target.value)
            const { submitValue: next } = parsePhoneToSubmitValue(
              country,
              event.target.value
            )
            syncHiddenValue(next)
          }}
          onBlur={handleNationalNumberBlur}
        />
      </div>
      {isCountryOpen ? (
        <div className="form-phone__dropdown">
          <input
            type="search"
            className="form-input form-phone__search"
            placeholder={phoneSearchPlaceholder(lang)}
            aria-label={phoneSearchAriaLabel(lang)}
            value={countryQuery}
            onChange={(event) => {
              setCountryQuery(event.target.value)
              setActiveCountryIndex(-1)
            }}
          />
          <ul id={listboxId} role="listbox" className="form-phone__list">
            {filteredCountries.map((option, index) => (
              <li key={option.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.code === country}
                  className={
                    index === activeCountryIndex
                      ? "form-phone__option form-phone__option--active"
                      : option.code === country
                        ? "form-phone__option form-phone__option--selected"
                        : "form-phone__option"
                  }
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCountry(option.code)}
                >
                  <span aria-hidden>{option.flag} </span>
                  {option.name} {option.callingCode}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}