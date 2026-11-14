import { refreshFormgongPowFieldBeforePost } from "@/lib/formgong-browser-signals"

export const FORMGONG_SUBMIT_ACTION = "https://formgong.com/submit"

export type FormgongJsonResponse = {
  success?: boolean
  message?: string
}

export function getTurnstileResponseFromForm(form: HTMLFormElement): string {
  const field = form.querySelector<HTMLInputElement>(
    '[name="cf-turnstile-response"]'
  )
  return field?.value.trim() ?? ""
}

export function resetTurnstileInForm(form: HTMLFormElement): void {
  const widget = form.querySelector(".cf-turnstile")
  try {
    if (widget instanceof HTMLElement && window.turnstile) {
      window.turnstile.reset(widget)
    }
  } catch {
    // Turnstile may not be loaded yet
  }
}

export type PostFormgongFormOptions = {
  accessKey: string
  /**
   * Mutate the form DOM before PoW and `FormData` (e.g. title-case names).
   */
  beforePost?: (form: HTMLFormElement) => void
}

/**
 * Refresh PoW, then POST multipart `FormData` to Formgong with JSON Accept header.
 * Do not set `Content-Type` — the browser must set multipart boundaries for files.
 */
export async function postFormgongForm(
  form: HTMLFormElement,
  options: PostFormgongFormOptions
): Promise<FormgongJsonResponse> {
  const trimmedKey = options.accessKey.trim()
  if (trimmedKey) {
    await refreshFormgongPowFieldBeforePost(form, trimmedKey)
  }
  options.beforePost?.(form)

  const response = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
    credentials: "omit",
  })

  return (await response.json()) as FormgongJsonResponse
}
