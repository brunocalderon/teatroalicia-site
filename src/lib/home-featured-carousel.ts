export const HOME_FEATURED_CAROUSEL_DESKTOP_MQ = "(min-width: 56rem)"

export const HOME_FEATURED_CAROUSEL_VISIBLE_COUNT = 3

const CAROUSEL_SELECTOR = "[data-home-featured-carousel]"
const TRACK_SELECTOR = "[data-home-featured-carousel-track]"
const PREV_SELECTOR = "[data-home-featured-carousel-prev]"
const NEXT_SELECTOR = "[data-home-featured-carousel-next]"

export function getHomeFeaturedCarouselMaxIndex(
  eventCount: number,
  visibleCount: number = HOME_FEATURED_CAROUSEL_VISIBLE_COUNT,
): number {
  if (eventCount <= visibleCount) {
    return 0
  }
  return eventCount - visibleCount
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
  const maxIndex = getHomeFeaturedCarouselMaxIndex(cards.length)
  const desktopMq = window.matchMedia(HOME_FEATURED_CAROUSEL_DESKTOP_MQ)

  let index = 0

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
      return
    }

    const step = measureCarouselStep(track, cards)
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`
    syncButtons()
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