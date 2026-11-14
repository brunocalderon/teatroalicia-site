/**
 * Site Content-Security-Policy (Turnstile, Formgong, marketing pixels).
 * Applied via `public/_headers` at build time and on the Astro dev server.
 *
 * Flexible (`data-size="flexible"`) Turnstile may `connect` to `data:,` from the
 * parent document — include `data:` in `connect-src`. Challenge iframes
 * (`…/flexible?lang=auto`) ship their own CSP; console noise there is on Cloudflare
 * (see Turnstile “Content Security Policy” docs).
 */

const SELF = "'self'"

/** Turnstile script, frame, font, worker, and XHR/fetch targets. */
const TURNSTILE_ORIGINS = [
  "https://challenges.cloudflare.com",
  "https://*.challenges.cloudflare.com",
  "https://*.dnstest.challenges.cloudflare.com",
  "https://dnstest.dev",
  "https://*.dnstest.dev",
  "https://cloudflarecaptcha.com",
  "https://*.cloudflarecaptcha.com",
] as const

/** Parent-page fetches for flexible / managed challenges (`data:,`, nested dnstest hosts). */
const TURNSTILE_CONNECT = ["data:", "blob:", ...TURNSTILE_ORIGINS] as const

const FORMGONG = "https://formgong.com"
const META_SCRIPT = "https://connect.facebook.net"
const META_IMG = "https://www.facebook.com"
const UMAMI_SCRIPT = "https://cloud.umami.is"
const UMAMI_CONNECT = "https://gateway.umami.is"
/** Cloudflare Web Analytics beacon (Pages / Zaraz injection). */
const CF_INSIGHTS = "https://static.cloudflareinsights.com"

export const CONTENT_SECURITY_POLICY = [
  `default-src ${SELF}`,
  `base-uri ${SELF}`,
  `object-src 'none'`,
  `frame-ancestors ${SELF}`,
  `script-src ${SELF} 'unsafe-inline' ${TURNSTILE_ORIGINS[0]} ${TURNSTILE_ORIGINS[1]} ${FORMGONG} ${META_SCRIPT} ${UMAMI_SCRIPT} ${CF_INSIGHTS}`,
  `style-src ${SELF} 'unsafe-inline' ${TURNSTILE_ORIGINS[0]} ${TURNSTILE_ORIGINS[1]}`,
  `img-src ${SELF} data: ${META_IMG}`,
  `font-src ${SELF} ${TURNSTILE_ORIGINS.join(" ")}`,
  `worker-src ${SELF} blob: ${TURNSTILE_ORIGINS.join(" ")}`,
  `frame-src ${TURNSTILE_ORIGINS.join(" ")}`,
  `connect-src ${SELF} ${TURNSTILE_CONNECT.join(" ")} ${FORMGONG} ${META_SCRIPT} ${META_IMG} ${UMAMI_SCRIPT} ${UMAMI_CONNECT} ${CF_INSIGHTS}`,
].join("; ")