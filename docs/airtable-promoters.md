# Airtable promoters roster

Guest-pass promoter roster is snapshotted from the **Promoters** table at build time (`npm run generate:promoters`, also `prebuild`). Production and dev read `src/generated/promoters.roster.json`; the client bundle uses `src/generated/promoters.public.json` (`active` + `Guest Passes Enabled` only).

## Environment

Same base as cartelera:

- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_PROMOTERS_TABLE_ID` (table **Promoters**)
- Optional `AIRTABLE_PROMOTERS_VIEW_ID`

When promoters env is unset, `generate:promoters` keeps the committed `promoters.roster.json` and still refreshes `promoters.public.json`.

## API request (build only)

`GET …/v0/{baseId}/{tableId}?cellFormat=string&timeZone=America%2FSantiago&userLocale=es_CL`

Optional `view={viewId}` when `AIRTABLE_PROMOTERS_VIEW_ID` is set.

## Fields

| Column | Required | Maps to |
| --- | --- | --- |
| `ID` | Yes | `id` (slug) |
| `Name` | Yes | `name` |
| `Active` | No | `active` (default `false`) |
| `Ticket Sales Enabled` | No | `ticket_sale_enabled` (default `false`) |
| `Guest Passes Enabled` | No | `guest_pass_enabled` (default `false`) |

Checkbox cells use Airtable string format (`checked` when on).

## Related

- Guest-pass `?e=` attribution: `docs/astro-form-request-forms.md`