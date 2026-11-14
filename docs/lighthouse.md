# Lighthouse (local)

Vitest runs [Lighthouse](https://github.com/GoogleChrome/lighthouse) against a **production build** served over **HTTPS** from `dist/` (self-signed cert in `tests/lighthouse/certs/`), so audits match static output on Cloudflare Pages (including Turnstile gating on form routes).

## Prerequisites

- **Google Chrome** or Chromium installed locally (`chrome-launcher` discovers it).
- Node **≥ 22.12** (see `package.json` `engines`).

## Commands

```bash
npm run lighthouse
# same as:
npm run test:lighthouse
```

`test:lighthouse` runs `npm run build` first, then starts preview (unless overridden) and audits every configured URL.

## URLs under test

Paths come from [`src/lib/lighthouse-targets.ts`](../src/lib/lighthouse-targets.ts):

- `/` (home)
- Each form `path` and thank-you route from `content/forms/*.md` (`thankYouPath`, default `{path}/gracias`)

## Thresholds and settings

Edit [`lighthouse.config.ts`](../lighthouse.config.ts):

- `minCategoryScore` (default **90**) for `performance`, `accessibility`, `best-practices`, and `seo`
- Mobile emulation only (`formFactor: "mobile"`)
- `auditRuns` (default **5**): median category score across repeated runs per URL

## Environment

| Variable | Purpose |
|----------|---------|
| `LIGHTHOUSE_BASE_URL` | If set (e.g. `https://127.0.0.1:4321`), Vitest **does not** spawn the HTTPS preview server; audits use this origin. Useful when iterating manually. |
| `FACEBOOK_PIXEL_ID` / `UMAMI_PIXEL_ID` | Use the **same real IDs as production** (not placeholders such as `1`). Invalid IDs are skipped at build time; placeholder values also break Umami with console errors during audits. |
| `MARKETING_TRACKING_CITY` | Meta payload `city` field (default `Santiago`). |
| `INVITATION_FORM_MARKETING_ENGAGE_MS` | Ms after `load` before Meta/Umami on invitation form pages (default `1000`). Set to `0` to disable timed engage on forms. |
| `MARKETING_INTERACTION_IDLE_TIMEOUT_MS` | Idle callback cap when home/thank-you pixels load after interaction (default `2000`). |

## Reports

When `saveReports` is `true`, JSON reports are written under `tests/lighthouse/reports/` (gitignored). Open them in Chrome DevTools → Lighthouse → “Load report”, or inspect audits/opportunities when a test fails.

## Notes

- Form pages load Formgong, Cloudflare Turnstile, and optional marketing pixels. On invitation form routes (`/i/...`), Meta/Umami fire **1s after `window` `load`** (`PageView` + `ViewContent` / Umami pageview + custom track). Home and thank-you routes still gate on **first user interaction**.
- Production builds run the `deferCssIntegration` hook (`src/integrations/defer-css.ts`), which rewrites page CSS to `rel="preload" as="style"` plus `onload` so bundled Astro stylesheets are not render-blocking.
- **Performance** and **Best practices** are often the first categories to fall below 90 until those assets are tuned.
- Strict thresholds are intentional regression guards; lower floors only in `lighthouse.config.ts` if you accept the tradeoff.