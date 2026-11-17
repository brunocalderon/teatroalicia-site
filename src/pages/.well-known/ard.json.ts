import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { buildArdManifest } from "@/lib/ard-manifest"
import { collectInvitationFormEntries } from "@/lib/invitation-form-entries"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const events = await getCollection("events")
  const invitationEntries = collectInvitationFormEntries(forms, events)
  const manifest = buildArdManifest(
    resolveSiteOrigin(),
    invitationEntries.map((entry) => ({
      id: entry.id,
      data: entry.data,
    })),
  )

  return new Response(JSON.stringify(manifest, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/ard+json; charset=utf-8",
    },
  })
}