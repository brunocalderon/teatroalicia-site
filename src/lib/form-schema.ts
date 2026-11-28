import { z } from "astro/zod"

import { hasBundledFormEventImage } from "@/lib/form-event-image"

const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

export const formFieldTypeSchema = z.enum([
  "text",
  "email",
  "tel",
  "url",
  "number",
  "date",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "file",
  "instagram",
  "referral",
])

export const formFieldSchema = z
  .object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: formFieldTypeSchema,
    required: z.boolean().optional().default(false),
    placeholder: z.string().optional(),
    options: z.array(fieldOptionSchema).optional(),
    accept: z.string().optional(),
    /** Field is shown only when this URL query param is present and non-empty; value prefills from it. */
    visibleWhenUrlParam: z.string().min(1).optional(),
  })
  .superRefine((field, ctx) => {
    if (
      (field.type === "select" || field.type === "radio") &&
      (!field.options || field.options.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: `Field "${field.name}" (${field.type}) requires at least one option`,
      })
    }
  })

export const formBodyFormatSchema = z.enum(["markdown", "html"])

export const formMessagesSchema = z
  .object({
    submit: z.string().optional(),
    sending: z.string().optional(),
    formNotConfigured: z.string().optional(),
    turnstileRequired: z.string().optional(),
    connectionFailed: z.string().optional(),
    formBody: z.string().optional(),
    /** When `html`, `formBody` is emitted as-is (Airtable Event Description). Default `markdown`. */
    formBodyFormat: formBodyFormatSchema.optional(),
    thankYouTitle: z.string().optional(),
    thankYouBody: z.string().optional(),
  })
  .optional()

export function sitePathSchema(label: string) {
  return z
    .string()
    .min(1)
    .superRefine((value, ctx) => {
      if (!value.startsWith("/")) {
        ctx.addIssue({
          code: "custom",
          message: `${label} must start with /`,
        })
      }
      if (value === "/") {
        ctx.addIssue({
          code: "custom",
          message: `${label} cannot be /`,
        })
      }
      if (value.includes("..")) {
        ctx.addIssue({
          code: "custom",
          message: `${label} cannot contain ..`,
        })
      }
    })
}

export const tokenSchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (value.trim() !== value || !value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "token must be non-empty and must not have leading or trailing whitespace",
      })
    }
  })

export const eventIdSchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (value.trim() !== value || !value.trim()) {
      ctx.addIssue({
        code: "custom",
        message:
          "eventId must be non-empty and must not have leading or trailing whitespace",
      })
    }
  })

export const eventDateTimeSchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    if (Number.isNaN(Date.parse(value))) {
      ctx.addIssue({
        code: "custom",
        message: "event date-time must be a parseable ISO 8601 string",
      })
    }
  })

export const formEventStatusSchema = z.enum([
  "EventScheduled",
  "EventCancelled",
  "EventPostponed",
  "EventRescheduled",
])

export type FormEventStatus = z.infer<typeof formEventStatusSchema>

export const formEventAttendanceModeSchema = z.enum([
  "OfflineEventAttendanceMode",
  "OnlineEventAttendanceMode",
  "MixedEventAttendanceMode",
])

export const formPerformerKindSchema = z.enum([
  "Person",
  "MusicGroup",
  "PerformingGroup",
  "Organization",
])

export const formPerformerSchema = z.object({
  name: z.string().min(1),
  kind: formPerformerKindSchema,
  sameAs: z.string().url().optional(),
})

export type FormPerformer = z.infer<typeof formPerformerSchema>

export const formEventKindSchema = z.enum([
  "general",
  "social",
  "music",
  "social-music",
  "business",
  "theater",
])

export type FormEventKind = z.infer<typeof formEventKindSchema>

export const formOrganizerKindSchema = z.enum(["Organization", "Person"])

export const formOrganizerSchema = z.object({
  name: z.string().min(1),
  kind: formOrganizerKindSchema.default("Organization"),
  url: z.string().url().optional(),
  sameAs: z.string().url().optional(),
})

export type FormOrganizer = z.infer<typeof formOrganizerSchema>

export const formTicketOfferSchema = z.object({
  name: z.string().optional(),
  url: z.string().url(),
  price: z.number().positive().optional(),
  priceCurrency: z.literal("CLP").optional(),
  availability: z
    .enum(["InStock", "SoldOut", "PreOrder", "LimitedAvailability"])
    .optional(),
  validFrom: eventDateTimeSchema.optional(),
})

export type FormTicketOffer = z.infer<typeof formTicketOfferSchema>

export const formEntrySchema = z
  .object({
    title: z.string().min(1),
    /** SEO meta description for the invitation form page (`<meta name="description">`). */
    description: z.string().min(1).max(320).optional(),
    path: sitePathSchema("path"),
    /** Posted as a hidden field so Formgong can tie submissions to an event. */
    eventId: eventIdSchema.optional(),
    /** ISO 8601 start date/time (America/Santiago offset) for event JSON-LD. */
    eventStart: eventDateTimeSchema.optional(),
    eventEnd: eventDateTimeSchema.optional(),
    eventStatus: formEventStatusSchema.optional(),
    eventAttendanceMode: formEventAttendanceModeSchema.optional(),
  /** Schema.org event classification for this occurrence. */
    eventKind: formEventKindSchema.optional().default("general"),
    performer: z.array(formPerformerSchema).optional(),
    organizer: formOrganizerSchema.optional(),
    /** When true, Teatro Alicia is the event organizer (venue-produced concert). */
    organizerIsVenue: z.boolean().optional().default(false),
    /** External ticket sales URL for this show. */
    ticketUrl: z.string().url().optional(),
    /** Alias for `ticketUrl` in form markdown (home CTA + offers). */
    ticketLink: z.string().url().optional(),
    /** Airtable `Ticket Supplier` → Formgong hidden `provider`. */
    ticketSupplier: z.string().min(1).optional(),
    /** Airtable `Supplier Event ID` → Formgong hidden `event_id`. */
    supplierEventId: z.string().min(1).optional(),
    /** Airtable `Guest Pass Ticket ID` → Formgong hidden `ticket_id`. */
    guestPassTicketId: z.string().min(1).optional(),
    /** Structured paid ticket offers with verified price data. */
    ticketOffers: z.array(formTicketOfferSchema).optional(),
    /** When true, schema includes guest-pass application (not free admission). */
    invitationOnly: z.boolean().optional(),
    /** Airtable guest-list off: show closed copy instead of Formgong (build-time only). */
    guestListClosed: z.boolean().optional(),
    isAccessibleForFree: z.boolean().optional(),
    typicalAgeRange: z.string().optional(),
    eventMaximumAttendeeCapacity: z.number().int().positive().optional(),
    token: tokenSchema,
    lang: z.string().optional().default("en"),
    submitLabel: z.string().optional().default("Submit"),
    thankYouPath: sitePathSchema("thankYouPath").optional(),
    nameFields: z.array(z.string().min(1)).optional(),
    messages: formMessagesSchema,
    /** Public path `/images/…` (`src/assets/images`). Event posters use Airtable cache at build. */
    image: sitePathSchema("image").optional(),
    imageAlt: z.string().min(1).optional(),
    /** When false, omits the “powered by Livestack” footer on the form page. */
    livestackFooter: z.boolean().optional().default(true),
    /** When false, hides the Instagram follow link on the thank-you page. */
    thankYouInstagram: z.boolean().optional().default(true),
    fields: z.array(formFieldSchema),
  })
  .transform((data) => ({
    ...data,
    thankYouPath: data.thankYouPath ?? `${data.path}/gracias`,
  }))
  .superRefine((data, ctx) => {
    const thankYouPrefix = `${data.path}/`
    if (!data.thankYouPath.startsWith(thankYouPrefix)) {
      ctx.addIssue({
        code: "custom",
        message: `thankYouPath must be under path (expected prefix "${thankYouPrefix}", got "${data.thankYouPath}")`,
      })
    }

    const names = new Set<string>()
    for (const field of data.fields) {
      if (names.has(field.name)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate field name: ${field.name}`,
        })
      }
      names.add(field.name)
    }
  })

export type FormField = z.infer<typeof formFieldSchema>
export type FormFieldType = z.infer<typeof formFieldTypeSchema>
export type FormEntryData = z.infer<typeof formEntrySchema>
export type FormMessages = NonNullable<z.infer<typeof formMessagesSchema>>

type FormCollectionEntry = {
  id: string
  data: FormEntryData
}

/**
 * Cross-entry checks (duplicate paths, form URL colliding with a thank-you URL).
 * Call once when generating routes.
 */
export function assertFormsCollectionIntegrity(entries: FormCollectionEntry[]): void {
  const pathsByForm = new Map<string, string>()
  const thankYouPaths = new Map<string, string>()

  for (const entry of entries) {
    const { path, thankYouPath } = entry.data

    const existingForm = pathsByForm.get(path)
    if (existingForm) {
      throw new Error(
        `Duplicate form path "${path}" in ${entry.id} and ${existingForm}`
      )
    }
    pathsByForm.set(path, entry.id)

    const existingThankYou = thankYouPaths.get(thankYouPath)
    if (existingThankYou && existingThankYou !== entry.id) {
      throw new Error(
        `Duplicate thankYouPath "${thankYouPath}" in ${entry.id} and ${existingThankYou}`
      )
    }
    thankYouPaths.set(thankYouPath, entry.id)
  }

  for (const entry of entries) {
    const { path, thankYouPath } = entry.data
    if (path === thankYouPath) {
      throw new Error(
        `Form path and thankYouPath must differ (${path}) in ${entry.id}`
      )
    }
    const thankYouOwner = thankYouPaths.get(path)
    if (thankYouOwner && thankYouOwner !== entry.id) {
      throw new Error(
        `Form path "${path}" in ${entry.id} conflicts with thank-you URL from ${thankYouOwner}`
      )
    }
    const formOwner = pathsByForm.get(thankYouPath)
    if (formOwner && formOwner !== entry.id) {
      throw new Error(
        `thankYouPath "${thankYouPath}" in ${entry.id} conflicts with form URL from ${formOwner}`
      )
    }
  }

  for (const entry of entries) {
    const { image } = entry.data
    if (image && !hasBundledFormEventImage(image)) {
      throw new Error(
        `Form image "${image}" in ${entry.id} has no matching bundled image in src/assets/images`,
      )
    }
  }
}

/** Guest-list and event frontmatter routes; general forms (e.g. contacto) omit event JSON-LD by design. */
function formExpectsEventJsonLd(
  data: Pick<FormEntryData, "path" | "eventStart" | "eventId" | "invitationOnly">,
): boolean {
  if (data.invitationOnly === true) {
    return true
  }
  if (data.path.startsWith("/i/")) {
    return true
  }
  if (data.eventId?.trim()) {
    return true
  }
  if (data.eventStart?.trim()) {
    return true
  }
  return false
}

/**
 * Logs Schema.org warnings (does not fail the build).
 * Call from static path generation after integrity checks.
 */
export function warnFormSchemaOrgFields(entries: FormCollectionEntry[]): void {
  for (const entry of entries) {
    if (!formExpectsEventJsonLd(entry.data)) {
      continue
    }
    const { eventStart, eventId, path } = entry.data
    if (!eventStart?.trim()) {
      console.warn(
        `[schema.org] Form "${entry.id}" (${path}) omits eventStart — event JSON-LD is skipped for this route.`,
      )
      continue
    }
    if (!eventId?.trim()) {
      console.warn(
        `[schema.org] Form "${entry.id}" (${path}) has eventStart but omits eventId — event JSON-LD is skipped.`,
      )
    }
  }
}

export function formEntryHasFileField(fields: readonly FormField[]): boolean {
  return fields.some((field) => field.type === "file")
}

export { defaultNameFields } from "@/lib/form-name-fields"

/** Passline or other public checkout URL from form frontmatter. */
export function resolvePublicTicketUrl(
  data: Pick<FormEntryData, "ticketUrl" | "ticketLink">,
): string | undefined {
  const fromTicketUrl = data.ticketUrl?.trim()
  if (fromTicketUrl) {
    return fromTicketUrl
  }
  const fromTicketLink = data.ticketLink?.trim()
  return fromTicketLink || undefined
}

/** `<meta name="description">` for invitation form routes. */
export function formMetaDescription(
  data: Pick<FormEntryData, "title" | "lang" | "description">,
): string {
  const custom = data.description?.trim()
  if (custom) {
    return custom
  }
  if (data.lang === "es") {
    return `Solicita tickets de cortesía para ${data.title} en Teatro Alicia, Santiago.`
  }
  return `Request courtesy tickets for ${data.title} at Teatro Alicia, Santiago.`
}
