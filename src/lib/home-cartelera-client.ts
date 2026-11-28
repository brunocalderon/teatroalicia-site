import { initCarteleraPosterLightbox } from "@/lib/cartelera-poster-lightbox"
import { initHomeFeaturedCarousel } from "@/lib/home-featured-carousel"
import { tryPrimeHomeFeaturedCarouselPosters } from "@/lib/home-featured-carousel-posters"
import { initHomeFeaturePosterFill } from "@/lib/home-feature-poster-fill"
import { initCarteleraEventDetailCtaTracking } from "@/lib/cartelera-event-detail-cta-tracking"
import { initCarteleraTicketCtaTracking } from "@/lib/cartelera-ticket-cta-tracking"
import { scheduleAfterLoadIdle } from "@/lib/schedule-after-load-idle"

const HOME_CARTELERA_IDLE_TIMEOUT_MS = 3_000

/** Non-critical cartelera UI: carousel, lightbox, poster fill, ticket analytics. */
export function initHomeCarteleraClient(): void {
  const cartelera = document.getElementById("cartelera")
  const carteleraRoot = cartelera ?? document
  initCarteleraPosterLightbox(carteleraRoot)
  tryPrimeHomeFeaturedCarouselPosters(carteleraRoot)
  initHomeFeaturedCarousel(carteleraRoot)
  initHomeFeaturePosterFill(carteleraRoot)

  const list = document.querySelector(".home-featured__list")
  if (list) {
    initCarteleraTicketCtaTracking(list)
    initCarteleraEventDetailCtaTracking(list)
  }
}

/** Call after full load so cartelera JS stays off the critical path. */
export function scheduleHomeCarteleraClientAfterLoad(): void {
  scheduleAfterLoadIdle(
    initHomeCarteleraClient,
    HOME_CARTELERA_IDLE_TIMEOUT_MS,
  )
}