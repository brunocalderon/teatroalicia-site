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

Before adding or changing forms, read `docs/astro-formgong-request-forms.md` and `docs/formgong-pow-submit-freeze.md`.

- **No** `@formgong/astro` — HTML `POST` via React `fetch` + `FormData`, `Accept: application/json`
- **No** `data-fg-success` / `data-fg-error` on the `<form>` if thank-you redirect is required (`fg.js` blocks navigation)
- Load `https://formgong.com/fg.js` and Turnstile `api.js?render=explicit` on form pages only
- Use shared helpers: `formgong-browser-signals.ts`, `formgong-submit.ts`, `formgong-thank-you.ts`, `TurnstileField`, `FormgongHiddenFields`
- Add each public form as a markdown file under `content/forms/` (`path`, `token`, `fields`); see `docs/astro-formgong-request-forms.md`
- Set `CLOUDFLARE_TURNSTILE_SITE_KEY` in env for all public Formgong forms (widget + token gate in production builds)
- During submit: keep fields in the DOM (`sr-only`), use `inert` on the fieldset (not `disabled`), call `refreshFormgongPowFieldBeforePost` (via `postFormgongForm`) before POST

## Lighthouse

After changes that affect performance, accessibility, SEO, or third-party scripts, run `npm run lighthouse` (build + Vitest audits). See `docs/lighthouse.md`; thresholds and paths live in `lighthouse.config.ts` and `src/lib/lighthouse-targets.ts`.

## Learned User Preferences

- Prefer new public forms as markdown under `content/forms/` rather than bespoke React form components unless custom UI logic is required.
- Event and invitation forms typically use neutral Spanish (`lang: es`; tú, not voseo) for field labels, messages, thank-you copy, and Livestack footer attribution (“Con la tecnología de Livestack”).
- Extend existing Formgong field UX and marketing pixel patterns in this repo rather than inventing new flows.
- Invitation thank-you pages use Spanish cortesía copy and the form/event title as the heading (not generic English).
- Keep form input and placeholder typography at **16px** base on mobile and desktop (`src/styles/formgong.css`).
- Keep agent and Formgong documentation scoped to this repo; do not reference external template repositories in `AGENTS.md` or `docs/`.
- Show Cloudflare Turnstile in `astro dev` when `CLOUDFLARE_TURNSTILE_SITE_KEY` is set (dummy site keys work); avoid production-only placeholder UX.
- Preserve form page photographic backgrounds via LQIP blur-up (tiny inline preview, swap to HD after load) rather than removing them for Lighthouse.
- Keep Lighthouse category floors at **≥90** unless the user explicitly relaxes `lighthouse.config.ts`; fix failing contrast on form placeholders and the Livestack footer label in `formgong.css` / `form-livestack-brand.astro`.
- Run Lighthouse against local HTTP without a dev SSL/cert harness; production enforces TLS—ignore local SSL audit warnings.
- Use a production-format `FACEBOOK_PIXEL_ID` (8+ digits) in env when testing Meta locally; placeholder IDs omit `MarketingHead` entirely.
- In `content/promoters.roster.ts`, use `no@email.com` instead of `@teatroalicia.cl` addresses on roster emails (referral CSV and exports); leave other domains unchanged.

## Learned Workspace Facts

- Teatro Alicia site (Astro); GitHub remote is `brunocalderon/teatroalicia-site`.
- Invitation forms are markdown at repo-root `content/forms/*.md` (not `src/content/forms`); the `forms` collection (`src/content.config.ts`) generates `src/pages/[...formPath].astro` with `ConfigurableForm` (`src/lib/form-schema.ts`).
- Formgong helpers and submit patterns live under `src/lib/` and `src/components/forms/` (see `configurable-form.tsx`); Tailwind v4 and shadcn (`src/components/ui/`) back specialized controls; form chrome in `src/styles/formgong.css` (placeholder and empty-date contrast via `color-mix` on dark fields).
- Schema requires `thankYouPath` to nest under `path` (default `{path}/gracias`); changing `path` without aligning thank-you breaks routes.
- Optional `image` / `imageAlt` in form markdown enable the split layout on `[...formPath].astro` (desktop grid: masthead spans columns, artwork left, form right; mobile order: masthead logo+title, then artwork, then form). Artwork uses `getImage` `srcset`/`sizes` from `src/assets/images/` via `resolveFormEventImageSource` (`form-event-image.ts`). Desktop `.form-page` is horizontally centered with `2rem` block margins (`width: min(75rem, calc(100% - 4rem))`).
- Generated form and thank-you pages include Teatro Alicia branding (`form-site-brand.astro`, `/logo.svg`), LQIP+HD backdrop (`form-page-background.generated.ts`, `body.form-page-bg-hd`), and by default a centered Livestack footer on the form page (`livestackFooter: false` in form markdown to hide; `form-livestack-brand.astro` with horizontal wordmark `src/assets/livestack-logo-white.png` via `?url` at `height: 1rem`, Spanish “Con la tecnología de Livestack” label + matching `aria-label`, `https://withlivestack.com?ref=teatroalicia`).
- Form fields are composable types in `src/components/forms/fields/` (registry + per-type `validate` / `normalize`); add new types in `form-schema.ts` and `registry.tsx` (`tel` → phone + country code, `date` → DD/MM/YYYY segments → `YYYY-MM-DD` on POST, `instagram` → normalize/validate). After new field types or schema changes, run `npx astro sync` or restart dev if validation looks stale.
- Marketing pixels: `MarketingHead` in `src/components/pixels/`. Invitation routes (`/i/...`) engage Meta/Umami after `window` `load` + `INVITATION_FORM_MARKETING_ENGAGE_MS` (client env; default 1000ms): Meta `PageView` + `ViewContent`, Umami pageview + custom track. Home and thank-you stay interaction-gated (`MARKETING_INTERACTION_IDLE_TIMEOUT_MS`). `marketing-pixel-ids.ts` omits pixels when IDs are placeholders. Meta loads via `ensureFacebookPixelBootstrap` then always `init` + tracks (no `consent` revoke before init; still runs when `window.fbq` already exists). Meta `city` from `MARKETING_TRACKING_CITY`. Submit `Lead` + advanced-matching PII; thank-you `CompleteRegistration` (`meta-pixel-pending-storage.ts`, `ThankYouBody`).
- Optional `eventId` in form markdown posts hidden field `eventId` via `FormgongHiddenFields` (with `access_key`; stays outside the inert fieldset on submit).
- Promoters: full roster in `content/promoters.roster.ts`; build generates `src/generated/promoters.public.json` (`id` + `name` for `active` + `guest_pass_enabled`). Referral CSV (`{form path}/referrals/csv`) is built from the roster at build time (same flags), not by hand-editing the public JSON. Guest-pass links use `?e=`; referral forms post hidden `referral` and `verified_promoter` (visible “Invitado por” only for eligible matches). Set server `SITE_URL` for live `form_link` values (`src/lib/site-origin.ts`, `CF_PAGES_URL` fallback).
- Production builds use `deferCssIntegration` (`src/integrations/defer-css.ts`) for non-blocking bundled CSS. Form routes inject Turnstile and Formgong after `window` `load`. Public discovery endpoints: `/robots.txt`, `/llms.txt` (`Layout.astro` `rel="describedby"`), `/.well-known/ard.json` (`src/lib/ard-manifest.ts`, form markdown paths).
- Content-Security-Policy is defined only in `src/lib/content-security-policy.ts` (`connect-src` includes `data:` and `blob:` for flexible Turnstile; allow `https://*.challenges.cloudflare.com` and related Turnstile captcha hosts; Umami uses `cloud.umami.is` + `gateway.umami.is`; CF Web Analytics uses `static.cloudflareinsights.com` in `script-src` and `connect-src`); the build writes `dist/_headers` and `cspDevServerPlugin` mirrors it in `astro dev`. **Remove any Content-Security-Policy** from Cloudflare Transform Rules or dashboard headers—combined policies are ANDed and a second header without `data:` breaks Turnstile.
