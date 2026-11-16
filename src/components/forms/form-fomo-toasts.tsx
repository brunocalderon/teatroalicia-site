import { useEffect } from "react"
import { toast } from "sonner"

import { BodyPortal } from "@/components/ui/body-portal"
import { Toaster } from "@/components/ui/sonner"
import { pickRandomFomoAccessMessage } from "@/lib/fomo-access-toast"

const DELAY_AFTER_FIRST_FOCUS_MS = 1_000
const BETWEEN_TOASTS_MS = 2_000
const TOAST_COUNT = 4
/** Dismiss the whole stack this long after the last toast is shown. */
const CLEAR_AFTER_LAST_TOAST_MS = 2_000

function isFormFieldFocusTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.matches('input[type="hidden"], .formgong-honeypot input')) {
    return false
  }
  return target.matches(
    "input:not([type=hidden]):not([type=submit]), textarea, select, [role=combobox]",
  )
}

type FormFomoToastsProps = {
  enabled: boolean
  form: HTMLFormElement | null
}

export function FormFomoToasts({ enabled, form }: FormFomoToastsProps) {
  useEffect(() => {
    if (!enabled || !form) {
      return
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let started = false
    const timeoutIds: number[] = []

    const runToastBurst = () => {
      const usedNameIndices = new Set<number>()
      const lastIndex = TOAST_COUNT - 1

      for (let index = 0; index < TOAST_COUNT; index += 1) {
        const delay = DELAY_AFTER_FIRST_FOCUS_MS + index * BETWEEN_TOASTS_MS
        const timeoutId = window.setTimeout(() => {
          toast(pickRandomFomoAccessMessage(usedNameIndices), {
            duration: Number.POSITIVE_INFINITY,
          })
        }, delay)
        timeoutIds.push(timeoutId)
      }

      const dismissAt =
        DELAY_AFTER_FIRST_FOCUS_MS +
        lastIndex * BETWEEN_TOASTS_MS +
        CLEAR_AFTER_LAST_TOAST_MS
      const dismissTimeoutId = window.setTimeout(() => {
        toast.dismiss()
      }, dismissAt)
      timeoutIds.push(dismissTimeoutId)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (started) {
        return
      }
      if (!isFormFieldFocusTarget(event.target)) {
        return
      }
      started = true
      form.removeEventListener("focusin", onFocusIn)
      runToastBurst()
    }

    form.addEventListener("focusin", onFocusIn)

    return () => {
      form.removeEventListener("focusin", onFocusIn)
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId)
      }
      toast.dismiss()
    }
  }, [enabled, form])

  if (!enabled) {
    return null
  }

  return (
    <BodyPortal>
      <Toaster
        position="top-center"
        offset={16}
        visibleToasts={TOAST_COUNT}
        expand={false}
        gap={0}
        closeButton={false}
        richColors={false}
      />
    </BodyPortal>
  )
}