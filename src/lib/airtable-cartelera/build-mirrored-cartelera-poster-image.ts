import sharp from "sharp"
import path from "node:path"

import { CARTELERA_POSTER_PUBLIC_SEGMENT } from "@/lib/airtable-cartelera/mirror-cartelera-poster"
import type { HomeEventFeatureImage } from "@/lib/home-event-feature-image"
import { HOME_EVENT_FEATURE_SIZES } from "@/lib/home-event-feature-sizes"

const CANDIDATE_WIDTHS = [640, 840, 1120, 1440] as const
const WEBP_QUALITY = 78
const JPEG_QUALITY = 82

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

export async function buildMirroredCarteleraPosterFeatureImage(
  slug: string,
  absoluteSourcePath: string,
  naturalWidth: number,
  naturalHeight: number,
): Promise<HomeEventFeatureImage> {
  const outputDir = path.dirname(absoluteSourcePath)
  const widths = widthsForSource(naturalWidth)

  const webpVariants = []
  const jpegVariants = []

  for (const width of widths) {
    const resized = sharp(absoluteSourcePath).resize({ width })

    const webpFileName = `${slug}-${width}w.webp`
    const webpOutputPath = path.join(outputDir, webpFileName)
    await resized
      .clone()
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpOutputPath)
    webpVariants.push({
      width,
      src: `/${CARTELERA_POSTER_PUBLIC_SEGMENT}/${webpFileName}`,
    })

    const jpegFileName = `${slug}-${width}w.jpg`
    const jpegOutputPath = path.join(outputDir, jpegFileName)
    await resized
      .clone()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(jpegOutputPath)
    jpegVariants.push({
      width,
      src: `/${CARTELERA_POSTER_PUBLIC_SEGMENT}/${jpegFileName}`,
    })
  }

  const largestWebp = webpVariants.at(-1)
  const largestJpeg = jpegVariants.at(-1)
  if (!largestWebp || !largestJpeg) {
    throw new Error(`No poster variants generated for cartelera slug "${slug}"`)
  }

  const aspect = naturalHeight / naturalWidth
  const height = Math.round(largestWebp.width * aspect)

  const mirrorPublicSrc = `/${CARTELERA_POSTER_PUBLIC_SEGMENT}/${path.basename(absoluteSourcePath)}`

  return {
    src: largestWebp.src,
    srcSet: webpVariants.map((variant) => `${variant.src} ${variant.width}w`).join(", "),
    sizes: HOME_EVENT_FEATURE_SIZES,
    width: largestWebp.width,
    height,
    fallbackSrc: largestJpeg.src,
    fallbackSrcSet: jpegVariants
      .map((variant) => `${variant.src} ${variant.width}w`)
      .join(", "),
    zoomSrc: mirrorPublicSrc,
  }
}