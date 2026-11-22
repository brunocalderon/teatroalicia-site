import type { ImageMetadata } from "astro"

const carteleraPosterModules = import.meta.glob<ImageMetadata>(
  "../../.cache/cartelera-posters/*.{apng,avif,gif,jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
)

function slugFromModulePath(modulePath: string): string | undefined {
  const fileName = modulePath.split("/").pop()
  if (!fileName) {
    return undefined
  }
  const dot = fileName.lastIndexOf(".")
  if (dot <= 0) {
    return undefined
  }
  return fileName.slice(0, dot)
}

const carteleraPosterBySlug = new Map<string, ImageMetadata>()

for (const [modulePath, image] of Object.entries(carteleraPosterModules)) {
  const slug = slugFromModulePath(modulePath)
  if (slug) {
    carteleraPosterBySlug.set(slug, image)
  }
}

export function carteleraPosterImageBySlug(
  slug: string,
): ImageMetadata | undefined {
  return carteleraPosterBySlug.get(slug)
}