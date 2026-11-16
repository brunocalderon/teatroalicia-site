/**
 * `<link rel="preconnect">` / `dns-prefetch` targets for every public HTML route.
 * Keep in sync with `src/lib/content-security-policy.ts` third-party allowlists.
 */
export type ResourceHintOrigin = {
  href: string
  /** Use for cross-origin script/font handshake (e.g. Meta, Umami). */
  crossOrigin?: boolean
}

/** Marketing pixels, Umami, and Cloudflare Web Analytics. */
export const marketingResourceHintOrigins: readonly ResourceHintOrigin[] = [
  { href: "https://static.cloudflareinsights.com" },
  { href: "https://cloud.umami.is", crossOrigin: true },
  { href: "https://gateway.umami.is" },
  { href: "https://connect.facebook.net", crossOrigin: true },
  { href: "https://www.facebook.com" },
]

/** Turnstile and Formgong on invitation form routes. */
export const formResourceHintOrigins: readonly ResourceHintOrigin[] = [
  { href: "https://challenges.cloudflare.com" },
  { href: "https://formgong.com" },
]