const INSTAGRAM_USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/

/** Strip leading `@` and return username when it matches Instagram handle rules. */
export function normalizeInstagramUsername(raw: string): string | undefined {
  const trimmed = raw.trim().replace(/^@/, "")
  if (!trimmed || !INSTAGRAM_USERNAME_PATTERN.test(trimmed)) {
    return undefined
  }
  return trimmed
}

export function instagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`
}