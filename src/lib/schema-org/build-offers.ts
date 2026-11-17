import {
  resolvePublicTicketUrl,
  type FormEntryData,
  type FormTicketOffer,
} from "@/lib/form-schema"

import { canonicalPageUrl } from "./canonical-origin"
import type { JsonLdObject } from "./json-ld-types"

const AVAILABILITY_URL = {
  InStock: "https://schema.org/InStock",
  SoldOut: "https://schema.org/SoldOut",
  PreOrder: "https://schema.org/PreOrder",
  LimitedAvailability: "https://schema.org/LimitedAvailability",
} as const

function ticketOfferNode(offer: FormTicketOffer): JsonLdObject {
  const node: JsonLdObject = {
    "@type": "Offer",
    url: offer.url,
    priceCurrency: offer.priceCurrency ?? "CLP",
    availability: offer.availability
      ? AVAILABILITY_URL[offer.availability]
      : AVAILABILITY_URL.InStock,
  }
  if (offer.name) {
    node.name = offer.name
  }
  if (offer.price !== undefined) {
    node.price = offer.price
  }
  if (offer.validFrom) {
    node.validFrom = offer.validFrom
  }
  return node
}

function guestPassApplicationOffer(pageUrl: string): JsonLdObject {
  return {
    "@type": "Offer",
    name: "Solicitud de invitación (sujeta a aprobación)",
    description:
      "Formulario de solicitud de pase de cortesía; la admisión no es automática y depende de aprobación.",
    url: pageUrl,
    availability: AVAILABILITY_URL.LimitedAvailability,
  }
}

export function buildEventOffers(data: FormEntryData): JsonLdObject[] {
  const pageUrl = canonicalPageUrl(data.path)
  const offers: JsonLdObject[] = []

  for (const ticket of data.ticketOffers ?? []) {
    offers.push(ticketOfferNode(ticket))
  }

  const publicTicketUrl = resolvePublicTicketUrl(data)
  if (publicTicketUrl) {
    const hasUrlOffer = offers.some(
      (offer) => offer.url === publicTicketUrl,
    )
    if (!hasUrlOffer) {
      offers.push({
        "@type": "Offer",
        url: publicTicketUrl,
        priceCurrency: "CLP",
        availability: AVAILABILITY_URL.InStock,
      })
    }
  }

  if (data.invitationOnly) {
    offers.push(guestPassApplicationOffer(pageUrl))
  }

  return offers
}