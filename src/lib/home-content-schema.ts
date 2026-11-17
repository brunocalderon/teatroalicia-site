import { z } from "astro/zod"

const offeringCopySchema = z.object({
  badge: z.string(),
  title: z.string(),
  body: z.string(),
  cta: z.string().optional(),
})

export const homeContentSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  hero: z.object({
    kicker: z.string(),
    slogan: z.string().optional(),
    lead: z.string(),
  }),
  cartelera: z.object({
    heading: z.string(),
    emptyTitle: z.string(),
    emptyLead: z.string(),
    emptyInstagramCta: z.string(),
  }),
  venueSection: z.object({
    kicker: z.string(),
    title: z.string(),
    body: z.string(),
    capacityNote: z.string(),
    photoAlt: z.string(),
  }),
  offeringsSection: z.object({
    kicker: z.string(),
    title: z.string(),
  }),
  offerings: z.object({
    liveMusic: offeringCopySchema,
    barFood: offeringCopySchema
      .omit({ body: true })
      .extend({ bodyFallback: z.string() }),
    maps: offeringCopySchema,
    amenities: offeringCopySchema.pick({ badge: true, title: true }),
    corporate: offeringCopySchema,
    private: offeringCopySchema,
  }),
})

export type HomeContent = z.infer<typeof homeContentSchema>