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

export const formMessagesSchema = z
  .object({
    submit: z.string().optional(),
    sending: z.string().optional(),
    formNotConfigured: z.string().optional(),
    turnstileRequired: z.string().optional(),
    connectionFailed: z.string().optional(),
    thankYouTitle: z.string().optional(),
    thankYouBody: z.string().optional(),
  })
  .optional()

function sitePathSchema(label: string) {
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

const tokenSchema = z
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

export const formEntrySchema = z
  .object({
    title: z.string().min(1),
    path: sitePathSchema("path"),
    token: tokenSchema,
    lang: z.string().optional().default("en"),
    submitLabel: z.string().optional().default("Submit"),
    thankYouPath: sitePathSchema("thankYouPath").optional(),
    nameFields: z.array(z.string().min(1)).optional(),
    messages: formMessagesSchema,
    /** Public path under `/images/`; file lives in `src/assets/images/` and is emitted hashed at build. */
    image: sitePathSchema("image").optional(),
    imageAlt: z.string().min(1).optional(),
    /** When false, omits the “powered by Livestack” footer on the form page. */
    livestackFooter: z.boolean().optional().default(true),
    fields: z.array(formFieldSchema).min(1),
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
        `Form image "${image}" in ${entry.id} has no matching file in src/assets/images/`,
      )
    }
  }
}

export function formEntryHasFileField(fields: readonly FormField[]): boolean {
  return fields.some((field) => field.type === "file")
}

export function defaultNameFields(fields: readonly FormField[]): string[] {
  const names = new Set(fields.map((field) => field.name))
  const result: string[] = []
  if (names.has("firstName")) {
    result.push("firstName")
  }
  if (names.has("lastName")) {
    result.push("lastName")
  }
  return result
}
