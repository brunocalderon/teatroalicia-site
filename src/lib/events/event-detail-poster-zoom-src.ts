import type { EventDetailPosterImage } from "@/lib/events/prepare-event-detail-page"

/** Largest responsive URL from split poster `srcSet` for lightbox zoom. */
export function eventDetailPosterZoomSrc(image: EventDetailPosterImage): string {
  const lastCandidate = image.srcSet.split(",").at(-1)?.trim()
  const url = lastCandidate?.split(/\s+/)[0]?.trim()
  return url && url.length > 0 ? url : image.src
}