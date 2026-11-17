import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { collectInvitationFormEntries } from "@/lib/invitation-form-entries"
import { buildLlmsTxt } from "@/lib/llms-txt"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const events = await getCollection("events")
  const invitationEntries = collectInvitationFormEntries(forms, events)
  const body = buildLlmsTxt(resolveSiteOrigin(), invitationEntries)

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}