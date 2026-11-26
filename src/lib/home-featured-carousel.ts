import { primeHomeFeaturedCarouselPosters } from "@/lib/home-featured-carousel-posters"

export const HOME_FEATURED_CAROUSEL_DESKTOP_MQ = "(min-width: 56rem)"

export const HOME_FEATURED_CAROUSEL_VISIBLE_COUNT = 3

const CAROUSEL_SELECTOR = "[data-home-featured-carousel]"
const TRACK_SELECTOR = "[data-home-featured-carousel-track]"
const PREV_SELECTOR = "[data-home-featured-carousel-prev]"
const NEXT_SELECTOR = "[data-home-featured-carousel-next]"
const INDICATOR_SELECTOR = "[data-home-featured-carousel-indicator]"
const INDICATOR_GLIDE_SELECTOR = "[data-home-featured-carousel-indicator-glide]"

export function getHomeFeaturedCarouselMaxIndex(
  eventCount: number,
  visibleCount: number = HOME_FEATURED_CAROUSEL_VISIBLE_COUNT,
): number {
  if (eventCount <= visibleCount) {
    return 0
  }
  return eventCount - visibleCount
}

/** Indicator indices (one hyphen per event) accented for the visible window. */
export function getHomeFeaturedCarouselActiveIndices(
  index: number,
  eventCount: number,
  visibleCount: number = HOME_FEATURED_CAROUSEL_VISIBLE_COUNT,
): number[] {
  if (eventCount <= 0) {
    return []
  }
  const windowSize = Math.min(visibleCount, eventCount)
  const maxIndex = getHomeFeaturedCarouselMaxIndex(eventCount, visibleCount)
  const clampedIndex = Math.min(Math.max(0, index), maxIndex)
  const result: number[] = []
  for (let offset = 0; offset < windowSize; offset += 1) {
    const indicatorIndex = clampedIndex + offset
    if (indicatorIndex < eventCount) {
      result.push(indicatorIndex)
    }
  }
  return result
}

function readFlexGapPx(track: HTMLElement): number {
  const styles = getComputedStyle(track)
  const gap = styles.columnGap || styles.gap
  const parsed = Number.parseFloat(gap)
  return Number.isFinite(parsed) ? parsed : 0
}

function measureCarouselStep(track: HTMLElement, cards: HTMLElement[]): number {
  const first = cards[0]
  if (!first) {
    return 0
  }
  return first.getBoundingClientRect().width + readFlexGapPx(track)
}

export function measureFeaturedCarouselIndicatorStep(
  indicators: readonly HTMLElement[],
): number {
  if (indicators.length >= 2) {
    const firstLeft = indicators[0].getBoundingClientRect().left
    const secondLeft = indicators[1].getBoundingClientRect().left
    return secondLeft - firstLeft
  }
  const first = indicators[0]
  if (!first) {
    return 0
  }
  const row = first.parentElement
  const gap = row ? readFlexGapPx(row) : 0
  return first.getBoundingClientRect().width + gap
}

export function initHomeFeaturedCarousel(root: ParentNode = document): void {
  const carousel = root.querySelector<HTMLElement>(CAROUSEL_SELECTOR)
  if (!carousel) {
    return
  }

  const track = carousel.querySelector<HTMLElement>(TRACK_SELECTOR)
  const prev = carousel.querySelector<HTMLButtonElement>(PREV_SELECTOR)
  const next = carousel.querySelector<HTMLButtonElement>(NEXT_SELECTOR)
  if (!track || !prev || !next) {
    return
  }

  const cards = [...track.querySelectorAll<HTMLElement>(".home-feature")]
  primeHomeFeaturedCarouselPosters(track)
  const maxIndex = getHomeFeaturedCarouselMaxIndex(cards.length)
  const desktopMq = window.matchMedia(HOME_FEATURED_CAROUSEL_DESKTOP_MQ)

  const indicators = [
    ...carousel.querySelectorAll<HTMLElement>(INDICATOR_SELECTOR),
  ]
  const indicatorGlide = carousel.querySelector<HTMLElement>(
    INDICATOR_GLIDE_SELECTOR,
  )

  let index = 0

  const syncIndicatorGlide = (indicatorStep: number): void => {
    if (!indicatorGlide) {
      return
    }
    if (!desktopMq.matches || indicatorStep <= 0) {
      indicatorGlide.style.removeProperty("transform")
      return
    }
    indicatorGlide.style.transform = `translate3d(${index * indicatorStep}px, 0, 0)`
  }

  const syncButtons = (): void => {
    prev.disabled = index <= 0
    next.disabled = index >= maxIndex
    carousel.dataset.homeFeaturedCarouselIndex = String(index)
  }

  const applyTransform = (): void => {
    if (!desktopMq.matches) {
      track.style.removeProperty("transform")
      index = 0
      syncButtons()
      syncIndicatorGlide(0)
      return
    }

    const step = measureCarouselStep(track, cards)
    const indicatorStep = measureFeaturedCarouselIndicatorStep(indicators)
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`
    syncButtons()
    syncIndicatorGlide(indicatorStep)
  }

  prev.addEventListener("click", () => {
    index = Math.max(0, index - 1)
    applyTransform()
  })

  next.addEventListener("click", () => {
    index = Math.min(maxIndex, index + 1)
    applyTransform()
  })

  desktopMq.addEventListener("change", applyTransform)
  window.addEventListener("resize", applyTransform, { passive: true })
  applyTransform()
}