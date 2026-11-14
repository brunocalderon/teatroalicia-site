import type { ImageMetadata } from "astro"

const formEventImageModules = import.meta.glob<ImageMetadata>(
  "../assets/images/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
)

const formEventImageByPath = new Map<string, ImageMetadata>()

for (const [modulePath, image] of Object.entries(formEventImageModules)) {
  const fileName = modulePath.split("/").pop()
  if (!fileName) {
    continue
  }
  formEventImageByPath.set(`/images/${fileName}`, image)
}

/**
 * Resolves markdown `image` paths to a bundled `src/assets/images` module.
 */
export function resolveFormEventImageSource(publicPath: string): ImageMetadata {
  const resolved = formEventImageByPath.get(publicPath)
  if (!resolved) {
    throw new Error(
      `No bundled form event image for "${publicPath}". Add the file under src/assets/images/ using the same filename.`,
    )
  }
  return resolved
}

export function hasBundledFormEventImage(publicPath: string): boolean {
  return formEventImageByPath.has(publicPath)
}