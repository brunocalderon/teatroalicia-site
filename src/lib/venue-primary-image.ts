import {
  hasBundledFormEventImage,
  resolveFormEventImageSource,
} from "@/lib/form-event-image"
import { buildVenueJsonLdImageSrc } from "@/lib/home-marketing-image"
import { CANONICAL_SITE_ORIGIN } from "@/lib/schema-org/canonical-origin"
import { venueConfig } from "../../content/venue"

/**
 * Absolute URL for the venue marketing photo in JSON-LD (`image` on LocalBusiness).
 * Uses the Astro image pipeline; omits when config points at a static public path only.
 */
export async function resolveVenuePrimaryImageAbsoluteUrl(): Promise<
  string | undefined
> {
  const path = venueConfig.imagePath?.trim()
  if (!path) {
    return undefined
  }
  if (!hasBundledFormEventImage(path)) {
    return new URL(path, CANONICAL_SITE_ORIGIN).href
  }
  const source = resolveFormEventImageSource(path)
  const src = await buildVenueJsonLdImageSrc(source)
  return new URL(src, CANONICAL_SITE_ORIGIN).href
}