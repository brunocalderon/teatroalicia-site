import { z } from "astro/zod"

import {
  eventDateTimeSchema,
  eventIdSchema,
  formEventAttendanceModeSchema,
  formEventKindSchema,
  formEventStatusSchema,
  formFieldSchema,
  formMessagesSchema,
  formOrganizerSchema,
  formPerformerSchema,
  formTicketOfferSchema,
  sitePathSchema,
  tokenSchema,
} from "@/lib/form-schema"

const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase letters, numbers, and hyphens",
  )

/** Guest-pass / invitation form embedded in an event markdown file. */
export const eventInvitationSchema = z
  .object({
    /** Defaults to `/i/{slug}` when omitted. */
    path: sitePathSchema("invitation.path").optional(),
    token: tokenSchema,
    lang: z.string().optional().default("es"),
    submitLabel: z.string().optional().default("Submit"),
    thankYouPath: sitePathSchema("invitation.thankYouPath").optional(),
    nameFields: z.array(z.string().min(1)).optional(),
    messages: formMessagesSchema,
    invitationOnly: z.boolean().optional(),
    livestackFooter: z.boolean().optional().default(true),
    fields: z.array(formFieldSchema),
  })
  .superRefine((invitation, ctx) => {
    const names = new Set<string>()
    for (const field of invitation.fields) {
      if (names.has(field.name)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate field name: ${field.name}`,
        })
      }
      names.add(field.name)
    }
  })

export const eventEntrySchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    description: z.string().min(1).max(320).optional(),
    lang: z.string().optional().default("es"),
    eventId: eventIdSchema,
    eventStart: eventDateTimeSchema,
    eventEnd: eventDateTimeSchema.optional(),
    eventStatus: formEventStatusSchema.optional(),
    eventAttendanceMode: formEventAttendanceModeSchema.optional(),
    eventKind: formEventKindSchema.optional().default("general"),
    performer: z.array(formPerformerSchema).optional(),
    organizer: formOrganizerSchema.optional(),
    organizerIsVenue: z.boolean().optional().default(false),
    ticketUrl: z.string().url().optional(),
    ticketLink: z.string().url().optional(),
    ticketOffers: z.array(formTicketOfferSchema).optional(),
    isAccessibleForFree: z.boolean().optional(),
    typicalAgeRange: z.string().optional(),
    eventMaximumAttendeeCapacity: z.number().int().positive().optional(),
    image: sitePathSchema("image").optional(),
    imageAlt: z.string().min(1).optional(),
    invitation: eventInvitationSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.invitation) {
      return
    }

    const path = resolveEventInvitationPath(data)
    if (!path.startsWith("/i/")) {
      ctx.addIssue({
        code: "custom",
        message: `invitation path must be /i/:slug (got "${path}")`,
        path: ["invitation", "path"],
      })
    }

    const thankYou =
      data.invitation.thankYouPath ?? defaultThankYouPathForInvitation(path)
    const prefix = `${path}/`
    if (!thankYou.startsWith(prefix)) {
      ctx.addIssue({
        code: "custom",
        message: `invitation.thankYouPath must be under invitation path (expected prefix "${prefix}")`,
        path: ["invitation", "thankYouPath"],
      })
    }
  })
  .transform((data) => {
    if (!data.invitation) {
      return data
    }

    const path = resolveEventInvitationPath(data)
    return {
      ...data,
      invitation: {
        ...data.invitation,
        path,
        thankYouPath:
          data.invitation.thankYouPath ?? defaultThankYouPathForInvitation(path),
      },
    }
  })

export type EventInvitation = z.infer<typeof eventInvitationSchema>
export type EventEntryData = z.infer<typeof eventEntrySchema>

export function defaultInvitationPath(slug: string): string {
  return `/i/${slug}`
}

function defaultThankYouPathForInvitation(invitationPath: string): string {
  return `${invitationPath}/gracias`
}

export function resolveEventInvitationPath(
  data: Pick<EventEntryData, "slug" | "invitation">,
): string {
  if (!data.invitation) {
    throw new Error("resolveEventInvitationPath requires invitation frontmatter")
  }
  return data.invitation.path ?? defaultInvitationPath(data.slug)
}

export function eventHasInvitation(
  data: Pick<EventEntryData, "invitation">,
): boolean {
  return data.invitation !== undefined
}