export const HOME_FEATURED_CAROUSEL_TRACK_SELECTOR =
  "[data-home-featured-carousel-track]"

export const MAIN_CARTELERA_POSTER_SELECTOR =
  ".home-feature__image:not([data-home-feature-poster-fill])"

export function pickLargestSrcsetUrl(srcset: string): string | null {
  const candidates = srcset
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  let bestUrl: string | null = null
  let bestWidth = -1

  for (const candidate of candidates) {
    const space = candidate.lastIndexOf(" ")
    if (space <= 0) {
      if (!bestUrl) {
        bestUrl = candidate
      }
      continue
    }
    const url = candidate.slice(0, space).trim()
    const descriptor = candidate.slice(space + 1).trim()
    const width = descriptor.endsWith("w")
      ? Number.parseInt(descriptor.slice(0, -1), 10)
      : 0
    if (url && width > bestWidth) {
      bestWidth = width
      bestUrl = url
    }
  }

  return bestUrl
}

function warmPosterImage(
  img: HTMLImageElement,
  picture: HTMLPictureElement | null,
): void {
  const warmer = new Image()
  warmer.decoding = "async"

  const webpSource = picture?.querySelector<HTMLSourceElement>(
    'source[type="image/webp"]',
  )
  if (webpSource?.srcset) {
    warmer.srcset = webpSource.srcset
    if (webpSource.sizes) {
      warmer.sizes = webpSource.sizes
    }
    const webpUrl = pickLargestSrcsetUrl(webpSource.srcset)
    if (webpUrl) {
      warmer.src = webpUrl
      return
    }
  }

  if (img.sizes) {
    warmer.sizes = img.sizes
  }
  if (img.srcset) {
    warmer.srcset = img.srcset
  }
  const resolved = img.currentSrc || img.src
  if (resolved) {
    warmer.src = resolved
  }
}

function markPosterFramePrimed(img: HTMLImageElement): void {
  if (img.naturalWidth <= 0) {
    return
  }
  img.closest(".home-feature__poster-frame")?.setAttribute(
    "data-poster-primed",
    "",
  )
  void img.decode?.().catch(() => {})
}

export function primeCarouselPosterImage(img: HTMLImageElement): void {
  img.loading = "eager"

  const picture = img.closest("picture")

  const onReady = () => {
    markPosterFramePrimed(img)
  }

  if (img.complete) {
    onReady()
  } else {
    img.addEventListener("load", onReady, { once: true })
  }

  warmPosterImage(img, picture)
}

export function primeHomeFeaturedCarouselPosters(track: ParentNode): void {
  const images = track.querySelectorAll<HTMLImageElement>(
    MAIN_CARTELERA_POSTER_SELECTOR,
  )
  for (const img of images) {
    primeCarouselPosterImage(img)
  }
}

export function tryPrimeHomeFeaturedCarouselPosters(
  root: ParentNode = document,
): void {
  const track = root.querySelector(HOME_FEATURED_CAROUSEL_TRACK_SELECTOR)
  if (!track) {
    return
  }
  primeHomeFeaturedCarouselPosters(track)
}