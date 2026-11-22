import { z } from "astro/zod"

const dayOfWeekSchema = z.union([
  z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  z
    .array(
      z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
    )
    .min(1),
])

const openingHoursSpecificationSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  opens: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "opens must be HH:MM (24h)"),
  closes: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "closes must be HH:MM (24h)"),
  description: z.string().optional(),
})

const amenitySchema = z.object({
  barFood: z.boolean(),
  barFoodDescription: z.string().optional(),
  cloakroom: z.boolean(),
  parking: z.boolean(),
  parkingDescription: z.string().optional(),
  smokingTerrace: z.boolean(),
})

export const venueConfigSchema = z.object({
  name: z.string().min(1),
  alternateName: z.string().optional(),
  description: z.string().min(1),
  slogan: z.string().optional(),
  keywords: z.array(z.string().min(1)).optional(),
  knowsAbout: z.array(z.string().min(1)).optional(),
  foundingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "foundingDate must be YYYY-MM-DD")
    .optional(),
  logoPath: z.string().startsWith("/"),
  imagePath: z.string().startsWith("/").optional(),
  schemaTypes: z
    .array(
      z.enum([
        "EventVenue",
        "MusicVenue",
        "EntertainmentBusiness",
        "NightClub",
        "PerformingArtsTheater",
      ]),
    )
    .min(1),
  address: z.object({
    streetAddress: z.string().min(1),
    addressLocality: z.string().min(1),
    addressRegion: z.string().min(1),
    postalCode: z.string().min(1),
    addressCountry: z.string().length(2),
  }),
  geo: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  googleMapsUrl: z.string().url(),
  googlePlaceId: z
    .string()
    .min(1)
    .regex(/^ChIJ[\w-]+$/, "googlePlaceId should be a Google Place ID (ChIJ…)"),
  contact: z.object({
    email: z.string().email(),
    telephone: z.string().min(1).optional(),
    whatsappTelephone: z.string().min(1).optional(),
    whatsappUrl: z.string().url().optional(),
    contactFormUrl: z.string().url().optional(),
  }),
  /** Empty when the venue opens only for scheduled events (see `openingHoursNote`). */
  openingHoursSpecification: z.array(openingHoursSpecificationSchema).default([]),
  openingHoursNote: z.string().min(1).optional(),
  priceRange: z.string().optional(),
  currenciesAccepted: z.array(z.string().min(1)).min(1),
  paymentAccepted: z.array(z.string().min(1)).min(1),
  maximumAttendeeCapacity: z.number().int().positive().optional(),
  amenities: amenitySchema,
  /** Verified external profiles only; venue URL is not listed here. */
  sameAs: z.array(z.string().url()).min(1),
  facebookPageUrl: z.string().url().optional(),
})

export type VenueConfig = z.infer<typeof venueConfigSchema>