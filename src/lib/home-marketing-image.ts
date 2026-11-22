import { getImage } from "astro:assets"
import type { ImageMetadata } from "astro"

/** Largest emitted width (4K displays; sources may be much larger). */
const MAX_MARKETING_WIDTH = 2560

/** Full-bleed hero backgrounds: cover + Ken Burns on large viewports. */
const HERO_MAX_WIDTH = MAX_MARKETING_WIDTH
const HERO_RETINA_WIDTH = 1920

/** Venue band photo: full width mobile, half grid on desktop. */
export const HOME_VENUE_PHOTO_SIZES =
  "(max-width: 56rem) 100vw, min(50vw, 36rem)"

const VENUE_CANDIDATE_WIDTHS = [640, 960, 1200, 1440, 1920] as const
const JSON_LD_VENUE_WIDTH = 1920

const WEBP_QUALITY = 80
const HERO_LQIP_WIDTH = 48

export type HomeHeroSlideBackground = {
  /** Full-bleed HD layer (`image-set` or single WebP `url()`). */
  hdBackground: string
  /** Tiny WebP for instant blur-up under the HD layer. */
  lqipBackground: string
  /** Primary WebP URL for `<link rel="preload">` (first slide). */
  preloadSrc: string
  preloadSrcSet?: string
  preloadSizes: string
}

export type HomeVenuePhotoImage = {
  src: string
  srcSet: string
  sizes: string
  width: number
  height: number
}

function widthsForSource(
  naturalWidth: number,
  candidates: readonly number[],
): number[] {
  const capped = Math.min(naturalWidth, MAX_MARKETING_WIDTH)
  const widths = candidates.filter((w) => w <= capped)
  if (widths.length === 0) {
    return [capped]
  }
  if (!widths.includes(capped)) {
    widths.push(capped)
  }
  return [...widths].sort((a, b) => a - b)
}

const quoteCssUrl = (src: string) => `url("${src}")`

function buildHeroHdBackground(
  standardSrc: string,
  largeSrc: string | undefined,
): string {
  if (!largeSrc || largeSrc === standardSrc) {
    return quoteCssUrl(standardSrc)
  }

  return `image-set(${quoteCssUrl(standardSrc)} type("image/webp") 1x, ${quoteCssUrl(largeSrc)} type("image/webp") 2x)`
}

/** Hero carousel slide backgrounds (HD + LQIP + preload hints). */
export async function buildHomeHeroSlideBackground(
  source: ImageMetadata,
): Promise<HomeHeroSlideBackground> {
  const standardWidth = Math.min(HERO_RETINA_WIDTH, source.width, MAX_MARKETING_WIDTH)
  const largeWidth = Math.min(HERO_MAX_WIDTH, source.width, MAX_MARKETING_WIDTH)
  const lqipWidth = Math.min(HERO_LQIP_WIDTH, source.width)

  const [standard, large, lqip] = await Promise.all([
    getImage({
      src: source,
      width: standardWidth,
      format: "webp",
      quality: WEBP_QUALITY,
    }),
    largeWidth > standardWidth
      ? getImage({
          src: source,
          width: largeWidth,
          format: "webp",
          quality: WEBP_QUALITY,
        })
      : Promise.resolve(undefined),
    getImage({
      src: source,
      width: lqipWidth,
      format: "webp",
      quality: 52,
    }),
  ])

  const preloadSrcSet =
    large && largeWidth > standardWidth
      ? `${standard.src} ${standardWidth}w, ${large.src} ${largeWidth}w`
      : `${standard.src} ${standardWidth}w`

  return {
    hdBackground: buildHeroHdBackground(standard.src, large?.src),
    lqipBackground: quoteCssUrl(lqip.src),
    preloadSrc: standard.src,
    preloadSrcSet,
    preloadSizes: "100vw",
  }
}

export async function buildHomeVenuePhotoImage(
  source: ImageMetadata,
): Promise<HomeVenuePhotoImage> {
  const widths = widthsForSource(source.width, VENUE_CANDIDATE_WIDTHS)
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
    throw new Error("No image variants generated for home venue photo")
  }

  const aspect = source.height / source.width
  const height = Math.round(largest.width * aspect)

  return {
    src: largest.src,
    srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(", "),
    sizes: HOME_VENUE_PHOTO_SIZES,
    width: largest.width,
    height,
  }
}

/** Representative venue image for Schema.org `image` (absolute URL built by caller). */
export async function buildVenueJsonLdImageSrc(
  source: ImageMetadata,
): Promise<string> {
  const width = Math.min(JSON_LD_VENUE_WIDTH, source.width, MAX_MARKETING_WIDTH)
  const optimized = await getImage({
    src: source,
    width,
    format: "webp",
    quality: WEBP_QUALITY,
  })
  return optimized.src
}

export const HOME_HERO_SLIDE_PATHS = [
  "/images/alicia-home-1.jpg",
  "/images/alicia-home-2.jpg",
  "/images/alicia-home-3.jpg",
  "/images/alicia-home-4.jpg",
] as const