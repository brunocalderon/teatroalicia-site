import type { MetaPixelUserData } from "@/lib/meta-pixel-user-data"

const STORAGE_KEY = "teatroalicia.meta.pixel.pending"
const MAX_AGE_MS = 30 * 60 * 1000

const META_USER_DATA_KEYS = [
  "em",
  "ph",
  "fn",
  "ln",
  "db",
  "ct",
  "country",
  "external_id",
] as const satisfies readonly (keyof MetaPixelUserData)[]

type PendingMetaPixelUserData = {
  userData: MetaPixelUserData
  savedAt: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseUserData(raw: unknown): MetaPixelUserData | undefined {
  if (!isRecord(raw)) {
    return undefined
  }
  const userData: MetaPixelUserData = {}
  for (const key of META_USER_DATA_KEYS) {
    const value = raw[key]
    if (typeof value === "string" && value.trim()) {
      userData[key] = value.trim()
    }
  }
  return Object.keys(userData).length > 0 ? userData : undefined
}

export function persistMetaPixelUserData(userData: MetaPixelUserData): void {
  if (typeof window === "undefined") {
    return
  }
  if (Object.keys(userData).length === 0) {
    return
  }
  const payload: PendingMetaPixelUserData = {
    userData,
    savedAt: Date.now(),
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota or private mode
  }
}

export function consumePendingMetaPixelUserData(): MetaPixelUserData | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return undefined
  }
  if (!raw) {
    return undefined
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return undefined
  }
  if (!isRecord(parsed)) {
    return undefined
  }
  const savedAt = parsed.savedAt
  if (typeof savedAt === "number" && Date.now() - savedAt > MAX_AGE_MS) {
    return undefined
  }
  return parseUserData(parsed.userData)
}