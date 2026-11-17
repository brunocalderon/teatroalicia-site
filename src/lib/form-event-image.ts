import type { ImageMetadata } from "astro"

const assetsImageModules = import.meta.glob<ImageMetadata>(
  "../assets/images/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
)

const eventCoLocatedImageModules = import.meta.glob<ImageMetadata>(
  "../../content/events/**/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
)

const CONTENT_EVENTS_MARKER = "content/events/"

const formEventImageByPath = new Map<string, ImageMetadata>()

for (const [modulePath, image] of Object.entries(assetsImageModules)) {
  const fileName = modulePath.split("/").pop()
  if (!fileName) {
    continue
  }
  formEventImageByPath.set(`/images/${fileName}`, image)
}

for (const [modulePath, image] of Object.entries(eventCoLocatedImageModules)) {
  const markerIndex = modulePath.lastIndexOf(CONTENT_EVENTS_MARKER)
  if (markerIndex === -1) {
    continue
  }
  const relative = modulePath.slice(markerIndex + CONTENT_EVENTS_MARKER.length)
  formEventImageByPath.set(`/events/${relative}`, image)
}

/**
 * Resolves markdown `image` paths to a bundled image module.
 * Event posters: `content/events/{slug}/{file}` → `/events/{slug}/{file}`.
 * Legacy form paths: `src/assets/images/` → `/images/{filename}`.
 */
export function resolveFormEventImageSource(publicPath: string): ImageMetadata {
  const resolved = formEventImageByPath.get(publicPath)
  if (!resolved) {
    throw new Error(
      `No bundled event image for "${publicPath}". Add the file under content/events/{slug}/ and set image to /events/{slug}/{file}, or use src/assets/images/ with /images/{file}.`,
    )
  }
  return resolved
}

export function hasBundledFormEventImage(publicPath: string): boolean {
  return formEventImageByPath.has(publicPath)
}