import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const lines = ["User-agent: *", "Allow: /"]

  for (const form of forms) {
    lines.push(`Disallow: ${form.data.path}/referrals/csv`)
  }

  lines.push("")

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}