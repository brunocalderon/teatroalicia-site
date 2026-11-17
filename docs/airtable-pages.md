# Airtable CMS pages

Generic marketing pages under `/info/…` are loaded at **build time** from an Airtable table into the `cmsPages` content collection. They are separate from event and Formgong markdown in `content/events` and `content/forms`.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `AIRTABLE_TOKEN` | For CMS pages | Personal access token with `data.records:read` on the base |
| `AIRTABLE_BASE_ID` | For CMS pages | Base ID (starts with `app`) |
| `AIRTABLE_CMS_TABLE_ID` | For CMS pages | CMS table ID or name; omit to disable |

When `AIRTABLE_TOKEN` or `AIRTABLE_BASE_ID` is missing, the loader logs a warning and the site builds with **zero** CMS routes (local development without secrets).

In Cloudflare Pages, store `AIRTABLE_TOKEN` as an **encrypted** environment variable.

## Airtable table

Create a table named `Pages` (or set `AIRTABLE_CMS_TABLE_ID`) with these columns (**exact names**):

| Column | Field type | Notes |
| --- | --- | --- |
| `slug` | Single line text | URL-safe id; becomes collection entry id |
| `path` | Single line text | Public path; must start with `/info/` |
| `title` | Single line text | Page title and H1 |
| `body` | Long text | Markdown (GFM) |
| `description` | Long text | Optional meta description |
| `lang` | Single line text | Optional; default `es` |

Example path: `/info/nosotros` with `slug` `nosotros`.

### Path rules

- Paths **must** start with `/info/` (validated at build).
- They must **not** collide with form or invitation routes from markdown (e.g. `/contacto`, `/i/murano`). The build fails if a collision is detected.

## Publish workflow

1. Add or edit a row in Airtable (every row in the table is included at build time).
2. Redeploy the site (or run `npm run build` in CI) so the loader fetches the latest records.

## Implementation map

- Loader: `src/lib/airtable-pages-loader.ts`
- Schema: `src/lib/cms-page-schema.ts`
- Route: `src/pages/[...cmsPath].astro`
- Discovery: CMS paths are listed in `/llms.txt` when present at build time.