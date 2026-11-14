import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { buildLlmsTxt } from "@/lib/llms-txt"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const body = buildLlmsTxt(resolveSiteOrigin(), forms)

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}