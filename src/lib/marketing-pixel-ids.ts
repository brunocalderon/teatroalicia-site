/** Skip placeholder / misconfigured marketing IDs that break Lighthouse and console. */

export function isConfiguredFacebookPixelId(id: string | undefined): boolean {
  const trimmed = id?.trim() ?? ""
  return /^\d{8,}$/.test(trimmed)
}

export function isConfiguredUmamiWebsiteId(id: string | undefined): boolean {
  const trimmed = id?.trim() ?? ""
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    trimmed,
  )
}