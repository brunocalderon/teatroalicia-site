const FORM_POW_URL = "https://formgong.com/pow"

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

/**
 * Formgong proof-of-work (same algorithm as fg.js). Returns `challenge~nonce`, or `"na"`.
 */
export async function solveFormPow(accessKey: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    return "na"
  }

  try {
    const response = await fetch(
      `${FORM_POW_URL}?k=${encodeURIComponent(accessKey)}`,
      { credentials: "omit" }
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
      const digestJobs: Promise<ArrayBuffer>[] = []
      for (let j = 0; j < 128; j++) {
        digestJobs.push(
          subtle.digest("SHA-256", encoder.encode(`${challenge}:${nonce++}`))
        )
      }
      const hashes = await Promise.all(digestJobs)

      for (let j = 0; j < 128; j++) {
        const bytes = new Uint8Array(hashes[j]!)
        let zeroBits = 0
        for (let z = 0; z < 256 && bytes[z >> 3] === 0; z += 8) {
          zeroBits += 8
        }
        const byte = bytes[zeroBits >> 3]!
        if (zeroBits + Math.clz32(byte) - 24 >= difficultyBits) {
          return `${challenge}~${nonce - 128 + j}`
        }
      }

      if (nonce >= 1_000_000) {
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
 * Wait for fg.js submit stamping, then resolve PoW (matching fg.js inline `ready()`),
 * and write `_fg_pow` before building `FormData`.
 */
export async function refreshFormPowFieldBeforePost(
  form: HTMLFormElement,
  accessKey: string,
  timeoutMs = DEFAULT_POW_WAIT_MS
): Promise<void> {
  const trimmedKey = accessKey.trim()
  if (!trimmedKey) {
    return
  }

  await new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

  const existingPow =
    form.querySelector<HTMLInputElement>('input[name="_fg_pow"]')?.value ?? ""
  if (existingPow.includes("~")) {
    return
  }

  const powFromRace = await Promise.race([
    solveFormPow(trimmedKey),
    sleep(timeoutMs).then(() => undefined),
  ])

  if (powFromRace) {
    setHiddenInput(form, "_fg_pow", powFromRace)
    return
  }

  const afterWait =
    form.querySelector<HTMLInputElement>('input[name="_fg_pow"]')?.value ?? ""
  if (afterWait && afterWait !== "p") {
    return
  }

  setHiddenInput(form, "_fg_pow", "na")
}
