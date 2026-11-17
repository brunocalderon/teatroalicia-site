import type { VenueConfig } from "@/lib/venue-schema"

export function instagramUrlFromVenue(venue: VenueConfig): string | undefined {
  return venue.sameAs?.find((url) =>
    /instagram\.com/i.test(url),
  )
}

export function facebookUrlFromVenue(venue: VenueConfig): string | undefined {
  return (
    venue.facebookPageUrl ??
    venue.sameAs?.find((url) => /facebook\.com/i.test(url))
  )
}