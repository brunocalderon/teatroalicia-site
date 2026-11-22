import type { ImageMetadata } from "astro"
import { getImage } from "astro:assets"

import {
  type HomeEventFeatureImage,
  widthsForHomeEventFeature,
} from "@/lib/home-event-feature-image"
import { HOME_EVENT_FEATURE_SIZES } from "@/lib/home-event-feature-sizes"

const WEBP_QUALITY = 78
const JPEG_QUALITY = 82

export async function buildCarteleraPosterFeatureImage(
  source: ImageMetadata,
): Promise<HomeEventFeatureImage> {
  const widths = widthsForHomeEventFeature(source.width)

  const webpVariants = await Promise.all(
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

  const jpegVariants = await Promise.all(
    widths.map(async (width) => {
      const optimized = await getImage({
        src: source,
        width,
        format: "jpg",
        quality: JPEG_QUALITY,
      })
      return { width, src: optimized.src }
    }),
  )

  const largestWebp = webpVariants.at(-1)
  const largestJpeg = jpegVariants.at(-1)
  if (!largestWebp || !largestJpeg) {
    throw new Error("No poster variants generated for cartelera poster")
  }

  const aspect = source.height / source.width
  const height = Math.round(largestWebp.width * aspect)

  const zoom = await getImage({
    src: source,
    width: source.width,
    format: "webp",
    quality: WEBP_QUALITY,
  })

  return {
    src: largestWebp.src,
    srcSet: webpVariants.map((v) => `${v.src} ${v.width}w`).join(", "),
    sizes: HOME_EVENT_FEATURE_SIZES,
    width: largestWebp.width,
    height,
    fallbackSrc: largestJpeg.src,
    fallbackSrcSet: jpegVariants
      .map((v) => `${v.src} ${v.width}w`)
      .join(", "),
    zoomSrc: zoom.src,
  }
}