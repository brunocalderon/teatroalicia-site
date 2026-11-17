import { getImage } from "astro:assets"
import type { ImageMetadata } from "astro"

export const HOME_EVENT_FEATURE_SIZES =
  "(max-width: 56rem) 78vw, 20rem"

const CANDIDATE_WIDTHS = [640, 840, 1120, 1440] as const
const WEBP_QUALITY = 78

export type HomeEventFeatureImage = {
  src: string
  srcSet: string
  sizes: string
  width: number
  height: number
}

function widthsForSource(naturalWidth: number): number[] {
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
  const widths = widthsForSource(source.width)
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