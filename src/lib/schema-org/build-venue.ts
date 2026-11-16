import type { VenueConfig } from "@/lib/venue-schema"

import { canonicalAssetUrl, canonicalPageUrl } from "./canonical-origin"
import { VENUE_ENTITY_ID } from "./ids"
import type { JsonLdObject } from "./json-ld-types"

function amenityFeatures(config: VenueConfig): JsonLdObject[] {
  const features: JsonLdObject[] = []
  const { amenities } = config

  if (amenities.barFood) {
    features.push({
      "@type": "LocationFeatureSpecification",
      name: "Bar y comida",
      value: true,
      ...(amenities.barFoodDescription
        ? { description: amenities.barFoodDescription }
        : {}),
    })
  }
  if (amenities.cloakroom) {
    features.push({
      "@type": "LocationFeatureSpecification",
      name: "Guardarropía",
      value: true,
    })
  }
  if (amenities.parking) {
    features.push({
      "@type": "LocationFeatureSpecification",
      name: "Estacionamiento",
      value: true,
      ...(amenities.parkingDescription
        ? { description: amenities.parkingDescription }
        : {}),
    })
  }
  return features
}

function venueSameAs(config: VenueConfig): string[] {
  const links = new Set<string>(config.sameAs)
  links.add(config.googleMapsUrl)
  if (config.facebookPageUrl) {
    links.add(config.facebookPageUrl)
  }
  return [...links]
}

function buildContactPoint(config: VenueConfig): JsonLdObject | undefined {
  const { contact } = config
  const point: JsonLdObject = {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: contact.email,
    availableLanguage: "es-CL",
  }

  if (contact.telephone) {
    point.telephone = contact.telephone
  }
  if (contact.whatsappUrl) {
    point.url = contact.whatsappUrl
  }
  if (contact.contactFormUrl) {
    point.url = contact.contactFormUrl
  }

  return point
}

export function buildVenueNode(config: VenueConfig): JsonLdObject {
  const logoUrl = canonicalAssetUrl(config.logoPath)
  const imageUrl = config.imagePath
    ? canonicalAssetUrl(config.imagePath)
    : logoUrl

  const node: JsonLdObject = {
    "@type": config.schemaTypes,
    "@id": VENUE_ENTITY_ID,
    name: config.name,
    description: config.description,
    url: canonicalPageUrl("/"),
    email: config.contact.email,
    logo: logoUrl,
    image: imageUrl,
    address: {
      "@type": "PostalAddress",
      ...config.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    },
    hasMap: config.googleMapsUrl,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "google_place_id",
      value: config.googlePlaceId,
    },
    currenciesAccepted: config.currenciesAccepted.join(", "),
    paymentAccepted: config.paymentAccepted.join(", "),
    sameAs: venueSameAs(config),
  }

  const contactPoint = buildContactPoint(config)
  if (contactPoint) {
    node.contactPoint = contactPoint
  }

  if (config.alternateName) {
    node.alternateName = config.alternateName
  }
  if (config.slogan) {
    node.slogan = config.slogan
  }
  if (config.keywords?.length) {
    node.keywords = config.keywords
  }
  if (config.knowsAbout?.length) {
    node.knowsAbout = config.knowsAbout
  }
  if (config.foundingDate) {
    node.foundingDate = config.foundingDate
  }
  if (config.priceRange) {
    node.priceRange = config.priceRange
  }
  if (config.maximumAttendeeCapacity) {
    node.maximumAttendeeCapacity = config.maximumAttendeeCapacity
  }

  const features = amenityFeatures(config)
  if (features.length > 0) {
    node.amenityFeature = features
  }

  if (config.openingHoursSpecification.length > 0) {
    node.openingHoursSpecification = config.openingHoursSpecification.map(
      (spec) => ({
        "@type": "OpeningHoursSpecification",
        ...spec,
      }),
    )
  }

  if (config.openingHoursNote) {
    node.additionalProperty = {
      "@type": "PropertyValue",
      name: "Horario de operación",
      value: config.openingHoursNote,
    }
  }

  return node
}