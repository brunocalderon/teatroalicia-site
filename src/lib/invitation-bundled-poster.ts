import { hasBundledFormEventImage } from "@/lib/form-event-image"

const BUNDLED_POSTER_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const

export function invitationSlugFromPath(formPath: string): string | undefined {
  const match = formPath.match(/^\/i\/([^/]+)/)
  return match?.[1]
}

/** Optional `src/assets/images/{slug}.{ext}` → `/images/…` for invitation split posters. */
export function resolveSlugBundledPosterPath(slug: string): string | undefined {
  for (const ext of BUNDLED_POSTER_EXTENSIONS) {
    const candidate = `/images/${slug}.${ext}`
    if (hasBundledFormEventImage(candidate)) {
      return candidate
    }
  }
  return undefined
}