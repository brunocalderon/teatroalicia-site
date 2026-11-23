import type { ImageMetadata } from "astro"

const assetsImageModules = import.meta.glob<ImageMetadata>(
  "../assets/images/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
)

const formEventImageByPath = new Map<string, ImageMetadata>()

for (const [modulePath, image] of Object.entries(assetsImageModules)) {
  const fileName = modulePath.split("/").pop()
  if (!fileName) {
    continue
  }
  formEventImageByPath.set(`/images/${fileName}`, image)
}

/**
 * Resolves markdown `image` paths to a bundled image module.
 * Form paths: `src/assets/images/` → `/images/{filename}`.
 */
export function resolveFormEventImageSource(publicPath: string): ImageMetadata {
  const resolved = formEventImageByPath.get(publicPath)
  if (!resolved) {
    throw new Error(
      `No bundled image for "${publicPath}". Add the file under src/assets/images/ with image: /images/{filename}.`,
    )
  }
  return resolved
}

export function hasBundledFormEventImage(publicPath: string): boolean {
  return formEventImageByPath.has(publicPath)
}