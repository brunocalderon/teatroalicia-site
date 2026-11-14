# Astro + Formgong request forms (agent playbook)

How this repo wires **Astro pages**, **React islands**, and **Formgong** so agents can add new request forms consistently.

Official Formgong agent notes: [formgong.com/agents.md](https://formgong.com/agents.md). Official HTML setup: [formgong.com/en/docs/html/](https://formgong.com/en/docs/html/). Astro env: [docs.astro.build — environment variables](https://docs.astro.build/en/guides/environment-variables/).

Shared modules live under `src/lib/formgong-*` and `src/components/forms/`.

## Goal

Ship multi-field request forms with:

- No custom backend (Formgong receives `POST https://formgong.com/submit`)
- Astro for the static page shell; React for interactive UI
- Cloudflare Turnstile on every form (production); optional file uploads (Turnstile still required)
- Inline error messages **and** a same-origin thank-you redirect on success
- Spam signals via Formgong `fg.js` (analytics + `_fg_*` fields) without handing submit to `fg.js` inline mode

Shared helpers in this repo:

| Piece | Location |
| --- | --- |
| PoW / `_fg_pow` | `src/lib/formgong-browser-signals.ts` |
| POST + Turnstile utils | `src/lib/formgong-submit.ts` |
| Thank-you URL + name normalize | `src/lib/formgong-thank-you.ts` |
| Default UI copy | `src/lib/formgong-copy.ts` |
| Turnstile widget | `src/components/forms/turnstile-field.tsx` |
| Hidden `access_key` / honeypot | `src/components/forms/formgong-hidden-fields.tsx` |
| Markdown form configs + schema | `content/forms/*.md`, `src/lib/form-schema.ts` |
| Generic form renderer | `src/components/forms/configurable-form.tsx` |
| Composable field types | `src/components/forms/fields/` (`registry.tsx`, per-type components) |
| Generated form + thank-you routes | `src/pages/[...formPath].astro` |

## Adding a form (default path)

1. Create `content/forms/<id>.md` with frontmatter: `title`, `path`, `token` (Formgong `fk_…` access key), and `fields` (see schema in `src/lib/form-schema.ts`).
2. Optional: `lang`, `submitLabel`, `thankYouPath` (defaults to `{path}/gracias`), `nameFields`, `messages`, `image` + `imageAlt` (event poster on the left; form panel on the right), `livestackFooter` (defaults to `true`; set `false` to hide the Livestack footer), and markdown body for intro copy. Set `image` to `/images/<filename>` and place the file in `src/assets/images/` (build emits a hashed URL under `/_astro/`).
3. Build or run dev — Astro generates the form page at `path` and the thank-you page at `thankYouPath`.

Example:

```md
---
title: Contact
path: /contacto
token: fk_your_public_access_key
lang: es
submitLabel: Enviar
fields:
  - name: firstName
    label: Nombre
    type: text
    required: true
  - name: email
    label: Email
    type: email
    required: true
  - name: message
    label: Mensaje
    type: textarea
    required: true
---

Optional intro above the form.
```

Field `type` values: `text`, `email`, `tel`, `url`, `number`, `date`, `textarea`, `select`, `radio`, `checkbox`, `file`, `instagram`, `referral`. Use `options` on `select` / `radio`. Use `accept` on `file` (Formgong attachments + Turnstile secret in dashboard).

Promoters and referral links: maintain the full roster in `src/config/promoters.roster.ts` (email, flags, etc.). `npm run build` runs `scripts/generate-promoters-public.mjs`, which writes `src/config/promoters.public.json` with only `id` and `name` for promoters where `active` and `guest_pass_enabled` are true; the production client bundle uses that file only. Invitation forms use `type: referral`. When the URL includes `?e=<promoter-id>`, the form always posts that value in `referral_id` (canonical `id` when it matches an eligible promoter, otherwise the raw `e` string). A hidden `referral_enabled` field is sent as `true` or `false`. The visible “Invitado por” row appears only when `e` matches an eligible promoter. Regenerate the public file after roster edits with `npm run generate:promoters`.

For each form that includes a `referral` field, the build also emits a static CSV at `{form path}/referrals/csv` (e.g. `/i/murano/referrals/csv`) with every roster column plus a `form_link` (`?e=<promoter id>`). Set `SITE_URL` in Cloudflare Pages to your public custom domain so links use the live hostname; `CF_PAGES_URL` is only a fallback and usually points at `*.pages.dev`.

Each `type` maps to a composable field in `src/components/forms/fields/registry.tsx` (control UI, optional `validate` on submit, optional `normalize` before POST). To add a specialized field: create a component, register it, and add the type to `formFieldTypeSchema` in `src/lib/form-schema.ts`. The `instagram` type strips `@` / profile URLs, validates username rules, and posts the normalized handle. The `date` type uses three numeric inputs (DD, MM, YYYY) in the UI and normalizes to `YYYY-MM-DD` before POST. The `tel` type uses a country-code dropdown (`libphonenumber-js`) and posts digits in E.164 form without the leading `+`.

Per-form tokens live in markdown (public keys). You do **not** add `FORM_TOKEN_*` env entries for each form.

## Architecture

```
Astro page
  ├─ <Layout>
  ├─ <MyForm client:only="react" />
  ├─ Turnstile script (explicit render)
  └─ fg.js (analytics / _fg_* stamping; do NOT use data-fg-success/error)
         │
         ▼
React <form action="https://formgong.com/submit" method="POST">
  access_key, _lang, botcheck, fields…, Turnstile, optional files
         │
         ▼
capture-phase validation → bubble-phase fetch(FormData) → thank-you or inline error
```

We do **not** use `@formgong/astro` / `@formgong/react`. The form is a normal HTML form posted with `fetch` + `FormData`.

## 1. Stack prerequisites

1. `@astrojs/react` (already in this repo)
2. A React form component hydrated from an `.astro` page
3. Public Formgong form(s) in the Formgong dashboard (one `access_key` / `fk_…` per form)
4. If any form uploads files: Cloudflare Turnstile site key on the page + **secret key in Formgong form settings** (Protection), and Attachments enabled in Formgong Expert mode

## 2. Environment variables (`astro:env`)

Formgong `access_key` values are **public** and are set per form in markdown `token`. Declare `CLOUDFLARE_TURNSTILE_SITE_KEY` in `astro.config.mjs` and `.env` for all form pages (public site key; secret lives in Formgong dashboard).

Do **not** put Turnstile **secrets** in client env; the secret lives only in the Formgong dashboard.

## 3. Astro page shell

Markdown-configured forms use `src/pages/[...formPath].astro`, which loads `fg.js` and Turnstile `api.js?render=explicit` on every form route (`ConfigurableForm` renders `TurnstileField`).

For a **custom** React form (non-markdown), mirror that shell:

```astro
---
import { MyForm } from "@/components/forms/my-form"
import Layout from "@/layouts/Layout.astro"
---

<Layout title="…">
  <MyForm client:only="react" />
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    async
    defer
  ></script>
  <script src="https://formgong.com/fg.js" async></script>
</Layout>
```

- Prefer `client:only="react"` for browser-only APIs.
- Load Turnstile with `?render=explicit` when using `TurnstileField`.
- Keep `fg.js` on the form page only, not on thank-you routes.

## 4. Form markup

`ConfigurableForm` already applies this markup. For custom forms, use `FormgongHiddenFields`, set `id={accessKey ? \`fg-${accessKey}\` : undefined}` on the `<form>`, and named inputs for each answer. See `configurable-form.tsx` for capture/bubble submit listener patterns.

**Do not** use `data-fg-success` / `data-fg-error` if you want a thank-you redirect — `fg.js` will not navigate in inline mode.

## 5. Submit pipeline

1. **Capture phase** — validate; `preventDefault` when config, per-field rules (registry `validate`), Turnstile, or business rules fail.
2. **Bubble phase** — `preventDefault`, set loading state, then:
   - `postFormgongForm(form, { accessKey, beforePost: normalizeFormNameFields })` from `src/lib/formgong-submit.ts`
   - Success → `window.location.assign(buildThankYouRedirectUrl(...))`
   - Failure → inline `role="alert"`; `resetTurnstileInForm(form)`

While submitting: keep fields in the DOM (`sr-only` wrapper), lock with **`inert`** on the fieldset (not `disabled`).

## 6. Proof-of-work

Call `refreshFormgongPowFieldBeforePost` before `FormData` (handled inside `postFormgongForm`). See `docs/formgong-pow-submit-freeze.md` for a prior main-thread freeze bug — copy `formgong-browser-signals.ts`, do not reimplement bit counting.

## 7. New form smoke test

Walk through sections 1–6 in this doc, then verify:

- `npm run build` succeeds (`npx astro sync` after schema or new field types).
- Dev/prod preview: Turnstile renders on form routes; submit posts to Formgong and redirects to `thankYouPath` with `?name=` when configured.
- Thank-you copy and event title render correctly (`ThankYouBody` reads the name from the query string).
- If the form has `type: referral`, test `?e=` attribution and `{path}/referrals/csv` after build with `SITE_URL` set.
