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

const FORM_SERVICE_ORIGIN = "https://formgong.com"
const META_SCRIPT = "https://connect.facebook.net"
/** Umami script + API (`cloud.umami.is`, `gateway.umami.is`). */
const UMAMI = "https://*.umami.is"
/** Cloudflare Web Analytics beacon (Pages / Zaraz injection). */
const CF_INSIGHTS = "https://static.cloudflareinsights.com"

/**
 * Meta Pixel AWS ECS beacons (`https://{id}.ecs.{region}.on.aws/...`).
 * CSP allows one wildcard label per host, so regions are listed explicitly.
 * Keep `dist/_headers` under Cloudflare Pages’ 2000-char header line limit —
 * extend only when pixel console reports blocked `connect-src`.
 */
const META_PIXEL_AWS_ECS_REGIONS = [
  "ap-northeast-1",
  "ap-south-1",
  "ap-southeast-1",
  "eu-central-1",
  "eu-west-1",
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
] as const

const META_PIXEL_AWS_ECS_CONNECT = META_PIXEL_AWS_ECS_REGIONS.map(
  (region) => `https://*.ecs.${region}.on.aws`,
)

/** Cloudflare Pages rejects `_headers` lines longer than this (chars, entire line). */
export const CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH = 2000

export const CSP_HEADERS_LINE_PREFIX = "  Content-Security-Policy: "

/** Meta Pixel Google Cloud Run beacons (`https://{service-id}.a.run.app`). */
const GCP_CLOUD_RUN_CONNECT = "https://*.a.run.app"

export const CONTENT_SECURITY_POLICY = [
  `default-src ${SELF}`,
  `base-uri ${SELF}`,
  `object-src 'none'`,
  `frame-ancestors ${SELF}`,
  `script-src ${SELF} 'unsafe-inline' ${TURNSTILE_ORIGINS[0]} ${TURNSTILE_ORIGINS[1]} ${FORM_SERVICE_ORIGIN} ${META_SCRIPT} ${UMAMI} ${CF_INSIGHTS}`,
  `style-src ${SELF} 'unsafe-inline' ${TURNSTILE_ORIGINS[0]} ${TURNSTILE_ORIGINS[1]}`,
  `img-src ${SELF} data: https://*.facebook.com`,
  `font-src ${SELF} ${TURNSTILE_ORIGINS.join(" ")}`,
  `worker-src ${SELF} blob: ${TURNSTILE_ORIGINS.join(" ")}`,
  `frame-src ${TURNSTILE_ORIGINS.join(" ")}`,
  `connect-src ${SELF} ${TURNSTILE_CONNECT.join(" ")} ${FORM_SERVICE_ORIGIN} ${META_SCRIPT} https://*.facebook.com ${UMAMI} ${CF_INSIGHTS} ${META_PIXEL_AWS_ECS_CONNECT.join(" ")} ${GCP_CLOUD_RUN_CONNECT}`,
].join("; ")

export const contentSecurityPolicyHeaderLineLength = (): number =>
  CSP_HEADERS_LINE_PREFIX.length + CONTENT_SECURITY_POLICY.length