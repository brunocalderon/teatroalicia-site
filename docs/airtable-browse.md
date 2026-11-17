# Airtable browse routes

Static debug/editor views of an Airtable table at:

- `/airtable` — `ul` / `li` list; link text is each row’s **slug**
- `/airtable/:slug` — optional preview from an **Image** attachment column, plus JSON (`slug`, `airtableRecordId`, optional `createdTime`, and `fields`)

At **build / content sync**, the loader downloads each row’s first **Image** attachment into `public/airtable-assets/{slug}/` (gitignored). Pages serve those static files (`'self'`); production does not load images from the Airtable CDN.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `AIRTABLE_TOKEN` | Yes | PAT with `data.records:read` |
| `AIRTABLE_BASE_ID` | Yes | Base ID (`app…`) |
| `AIRTABLE_TABLE_ID` | Yes | Table ID (`tbl…`) or name |

Fetches use the REST API with `cellFormat=string`, `timeZone=America/Santiago`, and `userLocale=es-CL` (same as the Airtable curl example).

## Row requirements

- A **Slug** column (single line text). Its value becomes the collection entry id and the URL segment (`/airtable/murano`).
- All other columns are passed through in `fields` on the detail page JSON.

Rows without `Slug` are skipped at build with a warning.

Optional **Image** (attachment): copied locally when download succeeds; failures log a warning and omit the preview.

## Related

- Generic marketing pages under `/info/…` use the separate `cmsPages` collection; see [`airtable-pages.md`](airtable-pages.md) and `AIRTABLE_CMS_TABLE_ID`.