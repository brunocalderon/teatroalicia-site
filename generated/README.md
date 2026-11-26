# Generated artifacts

| Path | Git | Purpose |
| --- | --- | --- |
| `snapshots/` | Committed | Build-time data imported by the app (e.g. Airtable promoter roster JSON, optional `cartelera.events.json` for dev). |
| `cache/` | Ignored | Ephemeral build cache (e.g. mirrored cartelera posters for `astro:assets`). |

Refresh promoters with `npm run generate:promoters` when Airtable changes. Refresh cartelera rows + poster cache in dev with `npm run sync:airtable` (requires Airtable env). Poster cache is also repopulated on `astro build` when cartelera env is set.