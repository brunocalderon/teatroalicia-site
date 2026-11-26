import { createPortal } from "react-dom"
import { useEffect, useRef, useState, type RefObject } from "react"

import { FormSubmitButton } from "@/components/forms/form-submit-button"

const MOBILE_MAX_WIDTH_REM = 55.99

type FormMobileStickySubmitProps = {
  fieldsetRef: RefObject<HTMLFieldSetElement | null>
  visibilityAnchorFieldName?: string
  submitLabel: string
  sendingLabel: string
  isSending: boolean
  disabled?: boolean
  suppress?: boolean
}

function isMobileViewport(): boolean {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_REM}rem)`).matches
}

function isElementFullyInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return rect.top >= 0 && rect.bottom <= window.innerHeight
}

function isElementPartiallyInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

function resolveVisibilityAnchor(
  fieldset: HTMLFieldSetElement,
  fieldName?: string,
): { element: Element; requiresFullVisibility: boolean } {
  if (fieldName) {
    const control = fieldset.querySelector(
      `#field-${CSS.escape(fieldName)}, [name="${CSS.escape(fieldName)}"]`,
    )
    const field = control?.closest(".form-field")
    if (field) {
      return { element: field, requiresFullVisibility: true }
    }
  }

  return { element: fieldset, requiresFullVisibility: false }
}

export function FormMobileStickySubmit({
  fieldsetRef,
  visibilityAnchorFieldName,
  submitLabel,
  sendingLabel,
  isSending,
  disabled,
  suppress,
}: FormMobileStickySubmitProps) {
  const [mounted, setMounted] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [present, setPresent] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const exitingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!shouldShow) {
      exitingRef.current = true
      setRevealed(false)
      return
    }
    exitingRef.current = false
    setPresent(true)
  }, [shouldShow])

  useEffect(() => {
    if (!present || !shouldShow) {
      return
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealed(true))
    })
    return () => cancelAnimationFrame(frame)
  }, [present, shouldShow])

  const handleDockTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return
    }
    if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
      return
    }
    if (!exitingRef.current || revealed) {
      return
    }
    exitingRef.current = false
    setPresent(false)
  }

  useEffect(() => {
    const fieldset = fieldsetRef.current
    if (!fieldset || suppress) {
      setShouldShow(false)
      return
    }

    let observer: IntersectionObserver | null = null
    let mutation: MutationObserver | null = null
    let observedElement: Element | null = null
    let requiresFullVisibility = false
    let detachMq: (() => void) | null = null

    const syncVisibility = (hideSticky: boolean) => {
      if (!isMobileViewport() || suppress) {
        setShouldShow(false)
        return
      }
      setShouldShow(!hideSticky)
    }

    const readHideSticky = (entry?: IntersectionObserverEntry) => {
      if (!observedElement) {
        return false
      }
      if (requiresFullVisibility) {
        if (entry) {
          return entry.isIntersecting && entry.intersectionRatio >= 1
        }
        return isElementFullyInViewport(observedElement)
      }
      if (entry) {
        return entry.isIntersecting
      }
      return isElementPartiallyInViewport(observedElement)
    }

    const attachObserver = () => {
      observer?.disconnect()

      const resolved = resolveVisibilityAnchor(
        fieldset,
        visibilityAnchorFieldName,
      )
      if (
        visibilityAnchorFieldName &&
        resolved.element === fieldset &&
        resolved.requiresFullVisibility === false
      ) {
        return false
      }

      requiresFullVisibility = resolved.requiresFullVisibility
      observedElement = resolved.element

      observer = new IntersectionObserver(
        ([entry]) => {
          syncVisibility(readHideSticky(entry))
        },
        { threshold: requiresFullVisibility ? [0, 1] : 0 },
      )
      observer.observe(observedElement)
      syncVisibility(readHideSticky())
      return true
    }

    if (!attachObserver()) {
      mutation = new MutationObserver(() => {
        if (attachObserver()) {
          mutation?.disconnect()
          mutation = null
        }
      })
      mutation.observe(fieldset, { childList: true, subtree: true })
    }

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_REM}rem)`)
    const onMqChange = () => {
      if (!mq.matches) {
        setShouldShow(false)
        return
      }
      syncVisibility(readHideSticky())
    }
    mq.addEventListener("change", onMqChange)
    detachMq = () => mq.removeEventListener("change", onMqChange)

    return () => {
      observer?.disconnect()
      mutation?.disconnect()
      detachMq?.()
    }
  }, [fieldsetRef, suppress, visibilityAnchorFieldName])

  const scrollToForm = () => {
    fieldsetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (!mounted || !present) {
    return null
  }

  const label = isSending ? sendingLabel : submitLabel

  return createPortal(
    <div
      className={[
        "form-submit-sticky",
        "form-form",
        revealed && "form-submit-sticky--visible",
      ]
        .filter(Boolean)
        .join(" ")}
      onTransitionEnd={handleDockTransitionEnd}
    >
      <FormSubmitButton
        type="button"
        label={label}
        disabled={disabled || isSending}
        onClick={scrollToForm}
      />
    </div>,
    document.body,
  )
}