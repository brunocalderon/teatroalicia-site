import { getImage } from "astro:assets"
import type { ImageMetadata } from "astro"

import { HOME_EVENT_FEATURE_SIZES } from "@/lib/home-event-feature-sizes"

export { HOME_EVENT_FEATURE_SIZES }

const CANDIDATE_WIDTHS = [640, 840, 1120, 1440] as const
const WEBP_QUALITY = 78

export type HomeEventFeatureImage = {
  /** Primary WebP `src` (also used when no JPEG fallback). */
  src: string
  srcSet: string
  sizes: string
  width: number
  height: number
  /** JPEG fallback for `<picture>` (mirrored Airtable posters). */
  fallbackSrc?: string
  fallbackSrcSet?: string
  /** Full-resolution mirror for poster lightbox (when distinct from card `src`). */
  zoomSrc?: string
}

export function widthsForHomeEventFeature(naturalWidth: number): number[] {
  const widths = CANDIDATE_WIDTHS.filter((w) => w <= naturalWidth)
  if (widths.length === 0) {
    return [naturalWidth]
  }
  if (!widths.includes(naturalWidth)) {
    widths.push(naturalWidth)
  }
  return [...widths].sort((a, b) => a - b)
}

export async function buildHomeEventFeatureImage(
  source: ImageMetadata,
): Promise<HomeEventFeatureImage> {
  const widths = widthsForHomeEventFeature(source.width)
  const variants = await Promise.all(
    widths.map(async (width) => {
      const optimized = await getImage({
        src: source,
        width,
        format: "webp",
        quality: WEBP_QUALITY,
      })
      return { width, src: optimized.src }
    }),
  )

  const largest = variants.at(-1)
  if (!largest) {
    throw new Error("No image variants generated for home event feature")
  }

  const aspect = source.height / source.width
  const height = Math.round(largest.width * aspect)

  return {
    src: largest.src,
    srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(", "),
    sizes: HOME_EVENT_FEATURE_SIZES,
    width: largest.width,
    height,
  }
}