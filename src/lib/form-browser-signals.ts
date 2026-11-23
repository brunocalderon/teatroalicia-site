const FORM_POW_URL = "https://formgong.com/pow"
const FORM_COLLECT_URL = "https://formgong.com/collect"

export type FormgongAttribution = {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  ref: string
  landing: string
  ads: string
  device: string
}

type FormgongSession = {
  startedAt: number
  keydowns: number
  pastes: number
  inputs: number
  started: boolean
  lastField: string
}

const formgongSessions = new WeakMap<HTMLFormElement, FormgongSession>()

function namedFormControlName(target: EventTarget | null): string | undefined {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.name || undefined
  }
  return undefined
}

function setHiddenInput(form: HTMLFormElement, name: string, value: string) {
  let input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
  if (!input) {
    input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    form.appendChild(input)
  }
  input.value = value
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Mirrors fg.js `read()` — UTM, referrer, landing path, ads click id, device class. */
export function readFormgongAttribution(
  search = typeof window !== "undefined"
    ? window.location.search
    : "",
  referrer = typeof document !== "undefined" ? document.referrer : "",
  pathname = typeof window !== "undefined" ? window.location.pathname : "",
  siteHost?: string,
): FormgongAttribution {
  const query = new URLSearchParams(search)
  const ads = query.get("gclid")
    ? "google"
    : query.get("fbclid")
      ? "meta"
      : query.get("msclkid")
        ? "microsoft"
        : ""

  let refHost = ""
  try {
    if (referrer) {
      refHost = new URL(referrer).hostname.replace(/^www\./, "")
    }
  } catch {
    refHost = ""
  }

  const resolvedSiteHost =
    siteHost ??
    (typeof window !== "undefined"
      ? String(window.location.hostname || "").replace(/^www\./, "")
      : "")
  if (refHost && refHost === resolvedSiteHost) {
    refHost = ""
  }

  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
  const device = /ipad|tablet/i.test(ua)
    ? "tablet"
    : /mobi|iphone|android/i.test(ua)
      ? "mobile"
      : "desktop"

  return {
    utm_source: (query.get("utm_source") || "").slice(0, 80),
    utm_medium: (query.get("utm_medium") || "").slice(0, 80),
    utm_campaign: (query.get("utm_campaign") || "").slice(0, 80),
    ref: refHost.slice(0, 253),
    landing: `${pathname}${search}`.slice(0, 180),
    ads,
    device,
  }
}

function sendFormgongCollect(body: Record<string, unknown>) {
  try {
    const data = JSON.stringify(body)
    if (typeof navigator !== "undefined" && navigator.sendBeacon?.(FORM_COLLECT_URL, data)) {
      return
    }
    void fetch(FORM_COLLECT_URL, {
      method: "POST",
      body: data,
      headers: { "content-type": "text/plain;charset=UTF-8" },
      keepalive: true,
      credentials: "omit",
    })
  } catch {
    // analytics only
  }
}

/** fg.js choice snapshot (`_fg_choices`). */
export function syncFormgongChoices(form: HTMLFormElement): void {
  const out: { field: string; value: string }[] = []
  const nodes = form.querySelectorAll(
    "select,input[type=radio]:checked,input[type=checkbox]:checked",
  )
  for (let i = 0; i < nodes.length && out.length < 20; i++) {
    const node = nodes[i]
    if (!(node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) {
      continue
    }
    const name = node.name
    if (!name || name.startsWith("_") || name === "access_key") {
      continue
    }
    const value = node.value || ""
    if (!value || value.length > 80 || value.includes("@")) {
      continue
    }
    out.push({ field: name.slice(0, 40), value: value.slice(0, 80) })
  }
  setHiddenInput(form, "_fg_choices", JSON.stringify(out))
}

export function stampFormgongAttributionFields(
  form: HTMLFormElement,
  attribution = readFormgongAttribution(),
): void {
  setHiddenInput(form, "_fg_utm_source", attribution.utm_source)
  setHiddenInput(form, "_fg_utm_medium", attribution.utm_medium)
  setHiddenInput(form, "_fg_utm_campaign", attribution.utm_campaign)
  setHiddenInput(form, "_fg_ref", attribution.ref)
  setHiddenInput(form, "_fg_landing", attribution.landing)
  setHiddenInput(form, "_fg_ads", attribution.ads)
  setHiddenInput(form, "_fg_device", attribution.device)
}

function stampFormgongBehaviorFields(form: HTMLFormElement): void {
  const session = formgongSessions.get(form)
  const elapsed = session ? Date.now() - session.startedAt : 0
  const keydowns = session?.keydowns ?? 0
  const pastes = session?.pastes ?? 0
  const inputs = session?.inputs ?? 0
  setHiddenInput(form, "_fg_b", `1.${elapsed}.${keydowns}.${pastes}.${inputs}`)
}

function hashMeetsDifficulty(bytes: Uint8Array, difficultyBits: number): boolean {
  let zeroBits = 0
  for (let z = 0; z < 256 && bytes[z >> 3] === 0; z += 8) {
    zeroBits += 8
  }
  const byteIndex = zeroBits >> 3
  if (byteIndex >= bytes.length) {
    return zeroBits >= difficultyBits
  }
  const byte = bytes[byteIndex]!
  return zeroBits + Math.clz32(byte) - 24 >= difficultyBits
}

export type SolveFormPowOptions = {
  signal?: AbortSignal
}

/**
 * Formgong proof-of-work (same algorithm as fg.js, with fixed leading-zero loop).
 * Returns `challenge~nonce`, or `"na"`.
 */
export async function solveFormPow(
  accessKey: string,
  options?: SolveFormPowOptions,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    return "na"
  }

  if (options?.signal?.aborted) {
    return "na"
  }

  try {
    const response = await fetch(
      `${FORM_POW_URL}?k=${encodeURIComponent(accessKey)}`,
      { credentials: "omit", signal: options?.signal },
    )
    if (!response.ok) {
      return "na"
    }

    const challenge = await response.text()
    const difficultyBits = Number(challenge.split(".")[3])
    if (!Number.isFinite(difficultyBits)) {
      return "na"
    }

    const encoder = new TextEncoder()
    let nonce = 0

    async function step(): Promise<string> {
      if (options?.signal?.aborted) {
        return "na"
      }

      const digestJobs: Promise<ArrayBuffer>[] = []
      for (let j = 0; j < 128; j++) {
        digestJobs.push(
          subtle.digest("SHA-256", encoder.encode(`${challenge}:${nonce++}`)),
        )
      }
      const hashes = await Promise.all(digestJobs)

      for (let j = 0; j < 128; j++) {
        const bytes = new Uint8Array(hashes[j]!)
        if (hashMeetsDifficulty(bytes, difficultyBits)) {
          return `${challenge}~${nonce - 128 + j}`
        }
      }

      if (nonce >= 1_000_000 || options?.signal?.aborted) {
        return "na"
      }
      return step()
    }

    return await step()
  } catch {
    return "na"
  }
}

const DEFAULT_POW_WAIT_MS = 2000

/**
 * Stamp behavior/choices, resolve PoW, and write `_fg_pow` before building `FormData`.
 * PoW runs only here (not on page load) so the tab stays responsive.
 */
export async function refreshFormPowFieldBeforePost(
  form: HTMLFormElement,
  accessKey: string,
  timeoutMs = DEFAULT_POW_WAIT_MS,
): Promise<void> {
  const trimmedKey = accessKey.trim()
  if (!trimmedKey) {
    return
  }

  await new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

  syncFormgongChoices(form)
  stampFormgongBehaviorFields(form)

  const existingPow =
    form.querySelector<HTMLInputElement>('input[name="_fg_pow"]')?.value ?? ""
  if (existingPow.includes("~")) {
    return
  }

  const controller = new AbortController()
  const abortTimer = window.setTimeout(() => controller.abort(), timeoutMs)

  let powFromRace: string | undefined
  try {
    powFromRace = await Promise.race([
      solveFormPow(trimmedKey, { signal: controller.signal }),
      sleep(timeoutMs).then(() => undefined),
    ])
  } finally {
    window.clearTimeout(abortTimer)
    controller.abort()
  }

  if (powFromRace) {
    setHiddenInput(form, "_fg_pow", powFromRace)
    return
  }

  setHiddenInput(form, "_fg_pow", "na")
}

/**
 * Replaces fg.js: stamps `_fg_*` attribution, tracks light session signals,
 * and sends view/start/abandon collect events. Does **not** mine PoW until submit.
 */
export function attachFormgongClientSignals(
  form: HTMLFormElement,
  accessKey: string,
): () => void {
  const trimmedKey = accessKey.trim()
  if (!trimmedKey || trimmedKey === "fk_your_access_key") {
    return () => {}
  }

  const attribution = readFormgongAttribution()
  stampFormgongAttributionFields(form, attribution)

  const session: FormgongSession = {
    startedAt: Date.now(),
    keydowns: 0,
    pastes: 0,
    inputs: 0,
    started: false,
    lastField: "",
  }
  formgongSessions.set(form, session)

  let viewSent = false
  let intersectionObserver: IntersectionObserver | undefined
  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewSent) {
            viewSent = true
            intersectionObserver?.disconnect()
            sendFormgongCollect({
              key: trimmedKey,
              type: "view",
              attribution,
            })
            break
          }
        }
      },
      { threshold: 0.4 },
    )
    intersectionObserver.observe(form)
  }

  const seenInputs = new Set<string>()

  const onFocusIn = (event: FocusEvent) => {
    const fieldName = namedFormControlName(event.target)
    if (!fieldName) {
      return
    }
    if (
      fieldName.startsWith("_") ||
      fieldName === "access_key" ||
      fieldName === "botcheck"
    ) {
      return
    }
    session.lastField = fieldName
    if (!session.started) {
      session.started = true
      sendFormgongCollect({
        key: trimmedKey,
        type: "start",
        field: fieldName,
        attribution,
      })
    }
  }

  const onKeydown = () => {
    session.keydowns += 1
  }
  const onPaste = () => {
    session.pastes += 1
  }
  const onInput = (event: Event) => {
    const fieldName = namedFormControlName(event.target)
    if (!fieldName) {
      return
    }
    const key = `$${fieldName}`
    if (!seenInputs.has(key)) {
      seenInputs.add(key)
      session.inputs += 1
    }
  }
  const onChange = () => {
    syncFormgongChoices(form)
  }

  const capturePassive = { capture: true, passive: true } as const
  form.addEventListener("focusin", onFocusIn)
  form.addEventListener("keydown", onKeydown, capturePassive)
  form.addEventListener("paste", onPaste, capturePassive)
  form.addEventListener("input", onInput, capturePassive)
  form.addEventListener("change", onChange)

  let abandonSent = false
  const onPageHide = () => {
    if (!session.started || abandonSent) {
      return
    }
    abandonSent = true
    sendFormgongCollect({
      key: trimmedKey,
      type: "abandon",
      field: session.lastField,
      attribution,
    })
  }
  window.addEventListener("pagehide", onPageHide)

  const onSubmitCollect = () => {
    abandonSent = true
    syncFormgongChoices(form)
    sendFormgongCollect({
      key: trimmedKey,
      type: "submit",
      attribution,
      choices: JSON.parse(
        form.querySelector<HTMLInputElement>('input[name="_fg_choices"]')?.value ||
          "[]",
      ),
    })
  }
  form.addEventListener("submit", onSubmitCollect)

  return () => {
    intersectionObserver?.disconnect()
    form.removeEventListener("focusin", onFocusIn)
    form.removeEventListener("keydown", onKeydown, capturePassive)
    form.removeEventListener("paste", onPaste, capturePassive)
    form.removeEventListener("input", onInput, capturePassive)
    form.removeEventListener("change", onChange)
    window.removeEventListener("pagehide", onPageHide)
    form.removeEventListener("submit", onSubmitCollect)
    formgongSessions.delete(form)
  }
}