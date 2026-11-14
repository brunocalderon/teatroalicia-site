import { getImage } from "astro:assets"
import type { ImageMetadata } from "astro"

/** Matches split layout breakpoints in `[...formPath].astro`. */
export const FORM_SPLIT_VISUAL_SIZES =
  "(max-width: 55.99rem) calc(100vw - 3.5rem), (min-width: 56rem) min(28rem, 42vw)"

const CANDIDATE_WIDTHS = [352, 480, 640, 768] as const
const WEBP_QUALITY = 72

export type FormSplitVisualImage = {
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

export async function buildFormSplitVisualImage(
  source: ImageMetadata,
): Promise<FormSplitVisualImage> {
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

  const srcSet = variants.map((v) => `${v.src} ${v.width}w`).join(", ")
  const lcpVariant =
    variants.find((v) => v.width === 352) ??
    variants.find((v) => v.width === 480) ??
    variants[variants.length - 1]!
  const aspect = source.height / source.width
  const displayWidth = lcpVariant.width
  const displayHeight = Math.round(displayWidth * aspect)

  return {
    src: lcpVariant.src,
    srcSet,
    sizes: FORM_SPLIT_VISUAL_SIZES,
    width: displayWidth,
    height: displayHeight,
  }
}