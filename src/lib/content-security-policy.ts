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

/**
 * Meta Pixel / AWS `on.aws` fetch targets (`https://{id}.ecs.{region}.on.aws/...`).
 * CSP allows one wildcard label per host, so each region is listed explicitly.
 */
const AWS_ECS_ON_AWS_REGIONS = [
  "af-south-1",
  "ap-east-1",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-northeast-3",
  "ap-south-1",
  "ap-south-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-southeast-3",
  "ap-southeast-4",
  "ap-southeast-5",
  "ca-central-1",
  "ca-west-1",
  "eu-central-1",
  "eu-central-2",
  "eu-north-1",
  "eu-south-1",
  "eu-south-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "il-central-1",
  "me-central-1",
  "me-south-1",
  "mx-central-1",
  "sa-east-1",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
] as const

const AWS_ECS_ON_AWS_CONNECT = AWS_ECS_ON_AWS_REGIONS.map(
  (region) => `https://*.ecs.${region}.on.aws`,
)

/** Meta Pixel Google Cloud Run beacons (`https://{service-id}.a.run.app`). */
const GCP_CLOUD_RUN_CONNECT = "https://*.a.run.app"

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
  `connect-src ${SELF} ${TURNSTILE_CONNECT.join(" ")} ${FORMGONG} ${META_SCRIPT} ${META_IMG} ${UMAMI_SCRIPT} ${UMAMI_CONNECT} ${CF_INSIGHTS} ${AWS_ECS_ON_AWS_CONNECT.join(" ")} ${GCP_CLOUD_RUN_CONNECT}`,
].join("; ")