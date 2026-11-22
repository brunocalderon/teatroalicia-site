import { getImage } from "astro:assets"
import type { ImageMetadata } from "astro"

/** Largest emitted width (4K displays; sources may be much larger). */
const MAX_MARKETING_WIDTH = 2560

/** Full-bleed hero backgrounds: cover + Ken Burns on large viewports. */
const HERO_MAX_WIDTH = MAX_MARKETING_WIDTH
const HERO_RETINA_WIDTH = 1920

/** Venue band photo: full width mobile, half of the viewport on desktop. */
export const HOME_VENUE_PHOTO_SIZES =
  "(max-width: 56rem) 100vw, 50vw"

const VENUE_CANDIDATE_WIDTHS = [
  640, 960, 1200, 1440, 1920, 2560,
] as const

/** Full-height contact split: sharper WebP + up to ~4K for retina half-viewport. */
const CONTACT_BAND_MAX_WIDTH = 3840
const CONTACT_BAND_CANDIDATE_WIDTHS = [
  1200, 1920, 2560, 3200, 3840,
] as const
const CONTACT_BAND_WEBP_QUALITY = 100

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
  maxOutputWidth = MAX_MARKETING_WIDTH,
): number[] {
  const capped = Math.min(naturalWidth, maxOutputWidth)
  const widths = candidates.filter((w) => w <= capped)
  if (widths.length === 0) {
    return [capped]
  }
  if (!widths.includes(capped)) {
    widths.push(capped)
  }
  return [...widths].sort((a, b) => a - b)
}

type VenuePhotoBuildOptions = {
  candidateWidths: readonly number[]
  maxOutputWidth: number
  quality: number
  sizes: string
}

async function buildVenuePhotoImageFromSource(
  source: ImageMetadata,
  options: VenuePhotoBuildOptions,
): Promise<HomeVenuePhotoImage> {
  const widths = widthsForSource(
    source.width,
    options.candidateWidths,
    options.maxOutputWidth,
  )
  const variants = await Promise.all(
    widths.map(async (width) => {
      const optimized = await getImage({
        src: source,
        width,
        format: "webp",
        quality: options.quality,
      })
      return { width, src: optimized.src }
    }),
  )

  const largest = variants.at(-1)
  if (!largest) {
    throw new Error("No image variants generated for venue photo")
  }

  const aspect = source.height / source.width
  const height = Math.round(largest.width * aspect)

  return {
    src: largest.src,
    srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(", "),
    sizes: options.sizes,
    width: largest.width,
    height,
  }
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
  return buildVenuePhotoImageFromSource(source, {
    candidateWidths: VENUE_CANDIDATE_WIDTHS,
    maxOutputWidth: MAX_MARKETING_WIDTH,
    quality: WEBP_QUALITY,
    sizes: HOME_VENUE_PHOTO_SIZES,
  })
}

export async function buildContactBandPhotoImage(
  source: ImageMetadata,
): Promise<HomeVenuePhotoImage> {
  return buildVenuePhotoImageFromSource(source, {
    candidateWidths: CONTACT_BAND_CANDIDATE_WIDTHS,
    maxOutputWidth: CONTACT_BAND_MAX_WIDTH,
    quality: CONTACT_BAND_WEBP_QUALITY,
    sizes: HOME_VENUE_PHOTO_SIZES,
  })
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