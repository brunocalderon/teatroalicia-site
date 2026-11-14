import { CLOUDFLARE_TURNSTILE_SITE_KEY } from "astro:env/client"
import { useEffect, useRef } from "react"

import { formgongCopy } from "@/lib/formgong-copy"

import "@/styles/formgong.css"

const turnstileSiteKey = CLOUDFLARE_TURNSTILE_SITE_KEY.trim()

/** Turnstile renders and is required only in production builds; `astro dev` skips it. */
export const TURNSTILE_ENABLED = import.meta.env.PROD

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
  copy = formgongCopy.turnstile,
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
    if (!TURNSTILE_ENABLED || !turnstileSiteKey || !containerRef.current) {
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
    return (
      <div className="formgong-turnstile">
        <span className="sr-only">{copy.label}</span>
        <div className="formgong-turnstile-placeholder">{copy.devPlaceholder}</div>
      </div>
    )
  }

  if (!turnstileSiteKey) {
    return (
      <div className="formgong-turnstile">
        <p>{copy.label}</p>
        <p className="formgong-alert" role="alert">
          {copy.siteKeyMissing}
        </p>
      </div>
    )
  }

  return (
    <div className="formgong-turnstile">
      <span className="sr-only">{copy.label}</span>
      <div ref={containerRef} className="formgong-turnstile-widget" />
    </div>
  )
}
