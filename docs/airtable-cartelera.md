# Airtable home cartelera

When `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_ID` (or optional `AIRTABLE_CARTELERA_TABLE_ID`) are set at **build**, the home **Cartelera** list and homepage JSON-LD are snapshotted from Airtable into static `/` HTML. **Production does not call the Airtable API at runtime** (no Pages Functions).

## Build-time fetch

The `carteleraPostersIntegration` hook mirrors upcoming poster attachments into `generated/cache/cartelera-posters/` (gitignored) at **production** `astro build` start when Airtable env is set (not on `astro dev`). Local dev reads `generated/snapshots/cartelera.events.json` and existing poster cache; refresh both with `npm run sync:airtable` when you want live data. `index.astro` loads mirrored posters via `import.meta.glob`, and `buildCarteleraPosterFeatureImage` uses `getImage` so responsive WebP/JPEG variants land in `dist/_astro/` (`<picture>` WebP + JPEG fallback). `carteleraPostersIntegration` performs the **only** live Events table list during `astro build` (writes `generated/cache/cartelera.events.json`); `index.astro` and guest-list routes read that cache. Dev uses `generated/snapshots/cartelera.events.json`. Production HTML never loads `airtableusercontent.com` images. Rebuild to refresh cartelera after Airtable changes.

## API request (build only)

`GET …/v0/{baseId}/{tableId}?cellFormat=string&timeZone=America%2FSantiago&userLocale=es_CL`

When `AIRTABLE_CARTELERA_VIEW_ID` is set, the request includes `view={viewId}` and returns only rows (and sort order) from that view.

(`fetchAirtableCarteleraRows` does not send `filterByFormula`; the home list still applies `isCarteleraEventVisible` and mapper rules such as `Publish`.)

## API response shape

Zod: `src/lib/airtable-cartelera/airtable-response-schema.ts` (`airtableCarteleraListResponseSchema`).

Each `records[]` entry:

| Property | Type | Notes |
| --- | --- | --- |
| `id` | string | Airtable record id |
| `createdTime` | string? | ISO UTC |
| `fields` | object | String cells for cartelera columns (see below) |

### `fields` (production table)

| Column | Required | Maps to |
| --- | --- | --- |
| `Slug` | Yes | `slug` |
| `Event Name` | Yes* | Card title (*or legacy `Title` only) |
| `Title` | Yes* | Stable `eventId` when `Event Name` is set |
| `Start` | Yes | `eventStart` (es_CL string or ISO) |
| `End` | No | `eventEnd` |
| `Purchase Link` | No | Ticket CTA URL |
| `Ticket Supplier` | No | Meta `TicketingOutboundClick` `destination` (falls back to ticket URL host when empty); Formgong hidden `provider` on guest-list forms |
| `Supplier Event ID` | No | Formgong hidden `event_id` on guest-list forms |
| `Guest Pass Ticket ID` | No | Formgong hidden `ticket_id` on guest-list forms |
| `Guest List` | No | When on, build emits `/i/{Slug}` and cartelera may CTA to the guest-list form |
| `Guest List Fields` | No | JSON array of form field definitions (see `form-schema` / murano invitation) |
| `Event Description` | No | Long text / HTML — raw markup for the split-layout intro on `/i/{slug}` when non-empty (not run through the markdown renderer; default copy stays markdown in `guest-list-form-intro.es.md`) |
| (env) | — | All guest-list forms use `AIRTABLE_INVITATION_FORM_TOKEN`; intro/thank-you markdown in `content/i18n/guest-list-form-*.es.md` via `guest-list-form.es.ts` |
| `Image` | No | Poster (`filename (https://…)` → mirrored locally at build) |
| `Event Kind` | No | Schema.org event type |
| `Publish` | No | When `false`, row is hidden |

Cartelera events are always Spanish (`lang: es`); there is no `Language` column in Airtable.

Legacy column names (`eventStart`, `ticketLink`, `Event ID`, etc.) are still accepted.

Fixture: `tests/fixtures/airtable-cartelera-list-response.json`.

## Related

- Guest-list forms: `docs/astro-form-request-forms.md`, `content/i18n/guest-list-form.es.ts`