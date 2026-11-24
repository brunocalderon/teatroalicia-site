# Generated artifacts

| Path | Git | Purpose |
| --- | --- | --- |
| `snapshots/` | Committed | Build-time data imported by the app (e.g. Airtable promoter roster JSON). |
| `cache/` | Ignored | Ephemeral build cache (e.g. mirrored cartelera posters for `astro:assets`). |

Refresh committed snapshots with `npm run generate:promoters` when Airtable changes. Cache is repopulated on `astro dev` / `astro build` when cartelera env is set.