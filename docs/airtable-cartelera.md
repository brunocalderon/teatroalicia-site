# Airtable home cartelera

When `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_ID` (or optional `AIRTABLE_CARTELERA_TABLE_ID`) are set at **build**, the home **Cartelera** list and homepage JSON-LD are snapshotted from Airtable into static `/` HTML. **Production does not call the Airtable API at runtime** (no Pages Functions).

## Build-time fetch

The `carteleraPostersIntegration` hook mirrors upcoming poster attachments into `src/.cache/cartelera-posters/` (gitignored) at `astro:build:start` and `astro:server:start` when Airtable env is set. `index.astro` loads those modules via `import.meta.glob`, and `buildCarteleraPosterFeatureImage` uses `getImage` so responsive WebP/JPEG variants land in `dist/_astro/` (`<picture>` WebP + JPEG fallback). The home page still calls `fetchAirtableCarteleraRows` for list/JSON-LD data. Production HTML never loads `airtableusercontent.com` images. Rebuild to refresh cartelera after Airtable changes.

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
| `Image` | No | Poster (`filename (https://…)` → mirrored locally at build) |
| `Event Kind` | No | Schema.org event type |
| `Language` | No | e.g. `es` |
| `Publish` | No | When `false`, row is hidden |

Legacy column names (`eventStart`, `ticketLink`, `Event ID`, etc.) are still accepted.

Fixture: `tests/fixtures/airtable-cartelera-list-response.json`.

## Related

- Markdown fallback when env is unset: `content/events/`