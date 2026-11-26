import { initCarteleraPosterLightbox } from "@/lib/cartelera-poster-lightbox"
import { initHomeFeaturedCarousel } from "@/lib/home-featured-carousel"
import { tryPrimeHomeFeaturedCarouselPosters } from "@/lib/home-featured-carousel-posters"
import { initHomeFeaturePosterFill } from "@/lib/home-feature-poster-fill"
import {
  resolveTicketCheckoutDestination,
  trackMetaTicketCheckoutClick,
} from "@/lib/meta-ticket-checkout"
import { scheduleAfterLoadIdle } from "@/lib/schedule-after-load-idle"
import { trackUmamiCarteleraTicketClick } from "@/lib/track-umami-cartelera-ticket"

const HOME_CARTELERA_IDLE_TIMEOUT_MS = 3_000

type CarteleraTicketClickEvent = Event & {
  __metaTicketCheckoutTracked?: boolean
}

/** Non-critical cartelera UI: carousel, lightbox, poster fill, ticket analytics. */
export function initHomeCarteleraClient(): void {
  const cartelera = document.getElementById("cartelera")
  const carteleraRoot = cartelera ?? document
  initCarteleraPosterLightbox(carteleraRoot)
  tryPrimeHomeFeaturedCarouselPosters(carteleraRoot)
  initHomeFeaturedCarousel(carteleraRoot)
  initHomeFeaturePosterFill(carteleraRoot)

  const list = document.querySelector(".home-featured__list")
  list?.addEventListener("click", (event) => {
    const clickEvent = event as CarteleraTicketClickEvent
    const target = (event.target as Element).closest<HTMLAnchorElement>(
      "[data-cartelera-ticket-cta]",
    )
    if (!target) {
      return
    }
    const eventName = target.dataset.eventTitle ?? ""
    const eventId = target.dataset.eventId?.trim() ?? ""
    trackUmamiCarteleraTicketClick({
      event_name: eventName,
      event_id: eventId,
    })

    if (clickEvent.__metaTicketCheckoutTracked) {
      return
    }
    clickEvent.__metaTicketCheckoutTracked = true

    const contentId =
      target.dataset.ticketContentId?.trim() ||
      target.dataset.eventId?.trim() ||
      target.dataset.eventCampaign ||
      "event"
    trackMetaTicketCheckoutClick({
      content_name: eventName,
      content_ids: [contentId],
      destination: resolveTicketCheckoutDestination(
        target.href,
        target.dataset.ticketSupplier,
      ),
    })
  })
}

/** Call after full load so cartelera JS stays off the critical path. */
export function scheduleHomeCarteleraClientAfterLoad(): void {
  scheduleAfterLoadIdle(
    initHomeCarteleraClient,
    HOME_CARTELERA_IDLE_TIMEOUT_MS,
  )
}