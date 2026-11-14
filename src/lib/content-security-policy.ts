/**
 * Site Content-Security-Policy (Turnstile, Formgong, marketing pixels).
 * Applied via `public/_headers` at build time and on the Astro dev server.
 *
 * Turnstile’s flexible challenge may `connect` to `data:,`; include `data:` in
 * `connect-src` or the browser reports CSP violations (challenge still often works).
 */

const SELF = "'self'"

/** Turnstile verification hosts (`*.challenges.cloudflare.com` covers hagen, brunhild, dnstest subdomains, etc.). */
const TURNSTILE_CONNECT = [
  "data:",
  "https://challenges.cloudflare.com",
  "https://*.challenges.cloudflare.com",
  "https://dnstest.dev",
  "https://*.dnstest.dev",
  "https://cloudflarecaptcha.com",
  "https://*.cloudflarecaptcha.com",
] as const

const FORMGONG = "https://formgong.com"
const META_SCRIPT = "https://connect.facebook.net"
const META_IMG = "https://www.facebook.com"
const UMAMI = "https://cloud.umami.is"

const TURNSTILE_FRAME = [
  "https://challenges.cloudflare.com",
  "https://*.challenges.cloudflare.com",
] as const

export const CONTENT_SECURITY_POLICY = [
  `default-src ${SELF}`,
  `base-uri ${SELF}`,
  `object-src 'none'`,
  `frame-ancestors ${SELF}`,
  `script-src ${SELF} 'unsafe-inline' https://challenges.cloudflare.com ${FORMGONG} ${META_SCRIPT} ${UMAMI}`,
  `style-src ${SELF} 'unsafe-inline' https://challenges.cloudflare.com`,
  `img-src ${SELF} data: ${META_IMG}`,
  `font-src ${SELF}`,
  `frame-src ${TURNSTILE_FRAME.join(" ")}`,
  `connect-src ${SELF} ${TURNSTILE_CONNECT.join(" ")} ${FORMGONG} ${META_SCRIPT} ${META_IMG} ${UMAMI}`,
].join("; ")