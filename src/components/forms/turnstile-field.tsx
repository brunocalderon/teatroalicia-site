import { CLOUDFLARE_TURNSTILE_SITE_KEY } from "astro:env/client"
import { useEffect, useRef } from "react"

import { formCopy } from "@/lib/form-copy"

import "@/styles/form.css"

const turnstileSiteKey = CLOUDFLARE_TURNSTILE_SITE_KEY.trim()

/** Turnstile renders and is required when `CLOUDFLARE_TURNSTILE_SITE_KEY` is set (dummy keys work in dev). */
export const TURNSTILE_ENABLED = turnstileSiteKey.length > 0

type TurnstileRenderOptions = {
  sitekey: string
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact" | "flexible"
  appearance?: "always" | "execute" | "interaction-only"
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
  "timeout-callback"?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetIdOrElement: string | HTMLElement) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

function waitForTurnstile(): Promise<NonNullable<Window["turnstile"]>> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  return new Promise((resolve) => {
    const previous = window.onloadTurnstileCallback
    window.onloadTurnstileCallback = () => {
      previous?.()
      if (window.turnstile) {
        resolve(window.turnstile)
      }
    }

    const intervalId = window.setInterval(() => {
      if (!window.turnstile) {
        return
      }
      window.clearInterval(intervalId)
      resolve(window.turnstile)
    }, 50)
  })
}

export function TurnstileField({
  copy = formCopy.turnstile,
  onTokenChange,
}: {
  copy?: {
    label: string
    siteKeyMissing: string
    devPlaceholder: string
  }
  onTokenChange?: (token: string | null) => void
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const onTokenChangeRef = useRef(onTokenChange)
  onTokenChangeRef.current = onTokenChange

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !containerRef.current) {
      onTokenChangeRef.current?.(null)
      return
    }

    let cancelled = false

    function clearToken() {
      onTokenChangeRef.current?.(null)
    }

    void waitForTurnstile().then((turnstile) => {
      if (cancelled || !containerRef.current) {
        return
      }
      if (widgetIdRef.current) {
        turnstile.remove(widgetIdRef.current)
      }
      clearToken()
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "light",
        size: "flexible",
        appearance: "interaction-only",
        callback: (token) => {
          onTokenChangeRef.current?.(token)
        },
        "expired-callback": clearToken,
        "error-callback": clearToken,
        "timeout-callback": clearToken,
      })
    })

    return () => {
      cancelled = true
      clearToken()
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = undefined
      }
    }
  }, [])

  if (!TURNSTILE_ENABLED) {
    if (import.meta.env.PROD) {
      return (
        <div className="form-turnstile">
          <p>{copy.label}</p>
          <p className="form-alert" role="alert">
            {copy.siteKeyMissing}
          </p>
        </div>
      )
    }

    return (
      <div className="form-turnstile">
        <span className="sr-only">{copy.label}</span>
        <div className="form-turnstile-placeholder">{copy.devPlaceholder}</div>
      </div>
    )
  }

  return (
    <div className="form-turnstile">
      <span className="sr-only">{copy.label}</span>
      <div ref={containerRef} className="form-turnstile-widget" />
    </div>
  )
}
