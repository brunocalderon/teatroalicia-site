import { z } from "astro/zod"

import { sitePathSchema } from "@/lib/form-schema"

const slugSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase letters, numbers, and hyphens",
  )

/** Build-time CMS page synced from Airtable (`cmsPages` collection). */
export const cmsPageSchema = z
  .object({
    slug: slugSchema,
    path: sitePathSchema("path"),
    title: z.string().min(1),
    body: z.string().default(""),
    description: z.string().min(1).optional(),
    lang: z.string().optional().default("es"),
  })
  .superRefine((data, ctx) => {
    if (!data.path.startsWith("/info/")) {
      ctx.addIssue({
        code: "custom",
        message: "path must start with /info/",
        path: ["path"],
      })
    }
  })

export type CmsPageData = z.infer<typeof cmsPageSchema>