# Agent instructions

Guidance for AI coding agents working in this repository.

## Git commits

When creating or managing git commits:

1. **Use the `/git-commit` skill** — read and follow `git-commit` (Conventional Commits workflow: analyze the diff, stage appropriately, generate the message, then commit).
2. **Always use Conventional Commits** — every commit message must match the format enforced by [Conventional Commits](https://www.conventionalcommits.org/) and this repo’s `@commitlint/config-conventional` setup (see `commitlint.config.js`).

Format:

```
<type>[optional scope]: <description>
```

Use standard types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`). Write the description in imperative mood, present tense, and keep the subject line under 72 characters.

Do not commit unless the user explicitly asks. Never commit secrets (`.env`, credentials, keys). Follow the Git Safety Protocol in project user rules: no `--no-verify`, no destructive git operations without explicit request, and do not amend unless those rules allow it.

## Formgong request forms

Before adding or changing forms, read `docs/astro-form-request-forms.md` and `docs/form-pow-submit-freeze.md`.

- **No** `@formgong/astro` — HTML `POST` via React `fetch` + `FormData`, `Accept: application/json`
- **No** `data-fg-success` / `data-fg-error` on the `<form>` if thank-you redirect is required (`fg.js` blocks navigation)
- Load `https://formgong.com/fg.js` and Turnstile `api.js?render=explicit` on form pages only
- Use shared helpers: `form-browser-signals.ts`, `form-submit.ts`, `form-thank-you.ts`, `TurnstileField`, `FormHiddenFields`
- Add each public form as a markdown file under `content/forms/` (`path`, `token`, `fields`); see `docs/astro-form-request-forms.md`
- Set `CLOUDFLARE_TURNSTILE_SITE_KEY` in env for all public Formgong forms (widget + token gate in production builds)
- During submit: keep fields in the DOM (`sr-only`), use `inert` on the fieldset (not `disabled`), call `refreshFormPowFieldBeforePost` (via `postForm`) before POST

## Lighthouse

After changes that affect performance, accessibility, SEO, or third-party scripts, run `npm run lighthouse` (build + Vitest audits). See `docs/lighthouse.md`; thresholds and paths live in `lighthouse.config.ts` and `src/lib/lighthouse-targets.ts`.

## Learned User Preferences

- Prefer new public forms as markdown under `content/forms/` rather than bespoke React form components unless custom UI logic is required.
- Public-facing routes (invitation forms, thank-you, error pages such as 404) use neutral Spanish (`lang: es`; tú, not voseo) for copy, field labels, and messages. Livestack footer uses English “Powered by Livestack” (visible label and `aria-label`).
- Extend existing Formgong field UX and marketing pixel patterns in this repo rather than inventing new flows.
- Invitation thank-you pages use Spanish cortesía copy and the form/event title as the heading (not generic English).
- Keep form input and placeholder typography at **16px** base on mobile and desktop (`src/styles/form.css`).
- Keep agent and Formgong documentation scoped to this repo; do not reference external template repositories in `AGENTS.md` or `docs/`.
- Show Cloudflare Turnstile in `astro dev` when `CLOUDFLARE_TURNSTILE_SITE_KEY` is set (dummy site keys work); avoid production-only placeholder UX.
- Preserve form page photographic backgrounds via LQIP blur-up (tiny inline preview, swap to HD after load) rather than removing them for Lighthouse.
- Keep Lighthouse category floors at **≥90** unless the user explicitly relaxes `lighthouse.config.ts`; fix failing contrast on form placeholders and the Livestack footer label in `form.css` / `form-livestack-brand.astro`.
- Run Lighthouse against local HTTP without a dev SSL/cert harness; production enforces TLS—ignore local SSL audit warnings.
- Use a production-format `FACEBOOK_PIXEL_ID` (8+ digits) in env when testing Meta locally; placeholder IDs omit `MarketingHead` entirely.
## Learned Workspace Facts

- Teatro Alicia site (Astro); GitHub remote is `brunocalderon/teatroalicia-site`. Spanish 404 at `src/pages/404.astro` → `dist/404.html`. Schema.org JSON-LD: edit `content/venue.ts`; builders in `src/lib/schema-org/*`; embedded via `Layout.astro`; canonical site URLs `https://teatroalicia.com/` (keep contact emails on `@teatroalicia.cl`). See `docs/schema-org.md`, `npm run build:json-ld`.
- Invitation forms are markdown at repo-root `content/forms/*.md` (not `src/content/forms`); the `forms` collection (`src/content.config.ts`) generates `src/pages/[...formPath].astro` with `ConfigurableForm` (`src/lib/form-schema.ts`).
- Form helpers and submit patterns live under `src/lib/` and `src/components/forms/` (see `configurable-form.tsx`); Tailwind v4 and shadcn (`src/components/ui/`) back specialized controls; form chrome in `src/styles/form.css` (placeholder and empty-date contrast via `color-mix` on dark fields).
- Schema requires `thankYouPath` to nest under `path` (default `{path}/gracias`); changing `path` without aligning thank-you breaks routes.
- Optional `image` / `imageAlt` in form markdown enable the split layout on `[...formPath].astro` (desktop grid: masthead spans columns, artwork left, form right; mobile order: masthead logo+title, then artwork, then form). Artwork uses `getImage` `srcset`/`sizes` from `src/assets/images/` via `resolveFormEventImageSource` (`form-event-image.ts`). Desktop `.form-page` is horizontally centered with `2rem` block margins (`width: min(75rem, calc(100% - 4rem))`).
- Home (`/`), 404, and generated form/thank-you pages share LQIP blur-up then HD backdrop (`site-page-backdrop-css.ts`; `deferredSiteBackdrop` or `formThirdPartyHints` on `Layout` runs post-`load` AVIF→WebP→JPEG via `scripts/generate-form-background-lqip.mjs` → `public/background.{avif,webp,jpg}`, `body.form-page-bg-hd`). Include Teatro Alicia branding (`site-brand.astro`, `/logo.svg`) and by default a centered Livestack footer on form pages (`livestackFooter: false` in form markdown to hide; `form-livestack-brand.astro` wordmark `lazy`, `fetchpriority="low"`, intrinsic `118×16`, “Powered by Livestack”, `https://withlivestack.com?ref=teatroalicia`—event poster should stay LCP, not the footer).
- Form fields are composable types in `src/components/forms/fields/` (registry + per-type `validate` / `normalize`); add new types in `form-schema.ts` and `registry.tsx` (`tel` → phone + country code, `date` → DD/MM/YYYY segments → `YYYY-MM-DD` on POST, `instagram` → normalize/validate). After new field types or schema changes, run `npx astro sync` or restart dev if validation looks stale. `ConfigurableForm` hydrates with `client:visible={{ rootMargin: "200px" }}`; client code imports `defaultNameFields` from `form-name-fields.ts` (not `form-schema.ts`, which pulls Zod); `form-thank-you` and marketing helpers load via dynamic `import()` on submit only.
- Marketing pixels: `MarketingHead` in `src/components/pixels/`. Any `Layout` route with `tracking` engages Meta/Umami after `window` `load` + `MARKETING_ENGAGE_MS` (client env; default 1000ms): Meta `PageView` + `ViewContent` (or form `Lead` / thank-you `CompleteRegistration`), Umami pageview + custom track. Pass `marketingEngageAfterLoadMs={0}` for interaction-gated loads (`MARKETING_INTERACTION_IDLE_TIMEOUT_MS`). `marketing-pixel-ids.ts` omits pixels when IDs are placeholders. Meta loads via `ensureFacebookPixelBootstrap` then always `init` + tracks (no `consent` revoke before init; still runs when `window.fbq` already exists). Meta `city` from `MARKETING_TRACKING_CITY`. Submit `Lead` + advanced-matching PII; thank-you `CompleteRegistration` (`meta-pixel-pending-storage.ts`, `ThankYouBody`).
- Optional `eventId` in form markdown posts hidden field `eventId` via `FormHiddenFields` (with `access_key`; stays outside the inert fieldset on submit).
- Promoters: full roster in `content/promoters.roster.ts`; build generates `src/generated/promoters.public.json` (`id` + `name` for `active` + `guest_pass_enabled`). Referral CSV (`{form path}/referrals/csv`) is built from the roster at build time (same flags), not by hand-editing the public JSON. Guest-pass links use `?e=`; referral forms post hidden `referral` and `verified_promoter` (visible “Invitado por” only for eligible matches). Set server `SITE_URL` for live `form_link` values (`src/lib/site-origin.ts`, `CF_PAGES_URL` fallback).
- Production builds use `deferCssIntegration` (`src/integrations/defer-css.ts`) for non-blocking bundled CSS. Form routes inject Turnstile and Formgong after `window` `load`. Public discovery endpoints: `/robots.txt`, `/llms.txt` (`Layout.astro` `rel="describedby"`), `/.well-known/ard.json` (`src/lib/ard-manifest.ts`, form markdown paths).
- Content-Security-Policy is defined only in `src/lib/content-security-policy.ts` (`connect-src` includes `data:` and `blob:` for flexible Turnstile; allow `https://*.challenges.cloudflare.com` and related Turnstile captcha hosts; Umami uses `cloud.umami.is` + `gateway.umami.is`; CF Web Analytics uses `static.cloudflareinsights.com` in `script-src` and `connect-src`); the build writes `dist/_headers` and `cspDevServerPlugin` mirrors it in `astro dev`. **Remove any Content-Security-Policy** from Cloudflare Transform Rules or dashboard headers—combined policies are ANDed and a second header without `data:` breaks Turnstile.
