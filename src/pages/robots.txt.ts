import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { collectInvitationFormEntries } from "@/lib/invitation-form-entries"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const events = await getCollection("events")
  const invitationEntries = collectInvitationFormEntries(forms, events)
  const lines = ["User-agent: *", "Allow: /"]

  const csvPaths = invitationEntries
    .map((entry) => entry.data.path)
    .sort((a, b) => a.localeCompare(b))

  for (const path of csvPaths) {
    lines.push(`Disallow: ${path}/referrals/csv`)
  }

  lines.push("")

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}