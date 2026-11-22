import path from "node:path"

/** Build-time Airtable poster mirrors (not under `public/`; optimized via `astro:assets`). */
export const CARTELERA_POSTER_CACHE_DIR = path.join(
  process.cwd(),
  "src",
  ".cache",
  "cartelera-posters",
)