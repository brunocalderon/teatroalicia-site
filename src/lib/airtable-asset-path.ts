import path from "node:path"

/** Static files copied to `dist/` from `public/`. */
export const AIRTABLE_ASSETS_PUBLIC_DIR = "/airtable-assets"

export function sanitizeAirtableAssetFilename(filename: string): string {
  const base = path.basename(filename.trim())
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_")
  return safe.length > 0 ? safe : "image"
}

export function airtableAssetPublicPath(slug: string, filename: string): string {
  return `${AIRTABLE_ASSETS_PUBLIC_DIR}/${slug}/${sanitizeAirtableAssetFilename(filename)}`
}

export function airtableAssetsRootDir(cwd = process.cwd()): string {
  return path.join(cwd, "public", "airtable-assets")
}