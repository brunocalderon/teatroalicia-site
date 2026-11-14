const INSTAGRAM_HOST = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/i

/** Strip @, trim, and extract username from pasted profile URLs. */
export function parseInstagramUsername(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return ""
  }

  const fromUrl = trimmed.match(INSTAGRAM_HOST)
  if (fromUrl?.[1]) {
    return fromUrl[1]
  }

  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed
}

export function isValidInstagramUsername(username: string): boolean {
  if (!username || username.length > 30) {
    return false
  }
  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return false
  }
  if (username.startsWith(".") || username.endsWith(".")) {
    return false
  }
  if (username.includes("..")) {
    return false
  }
  return true
}

export function instagramValidationMessage(lang: string): string {
  return lang === "es"
    ? "Ingresa un usuario de Instagram válido (sin @, hasta 30 caracteres)."
    : "Enter a valid Instagram username (no @, up to 30 characters)."
}
