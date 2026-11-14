const formEventImageModules = import.meta.glob<string>(
  "../assets/images/*.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" },
)

const formEventImageUrlByPath = new Map<string, string>()

for (const [modulePath, url] of Object.entries(formEventImageModules)) {
  const fileName = modulePath.split("/").pop()
  if (!fileName) {
    continue
  }
  formEventImageUrlByPath.set(`/images/${fileName}`, url)
}

/**
 * Resolves markdown `image` paths (e.g. `/images/poster.jpg`) to a build-hashed URL.
 */
export function resolveFormEventImageUrl(publicPath: string): string {
  const resolved = formEventImageUrlByPath.get(publicPath)
  if (!resolved) {
    throw new Error(
      `No bundled form event image for "${publicPath}". Add the file under src/assets/images/ using the same filename.`,
    )
  }
  return resolved
}

export function hasBundledFormEventImage(publicPath: string): boolean {
  return formEventImageUrlByPath.has(publicPath)
}