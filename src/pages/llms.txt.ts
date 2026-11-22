import type { APIRoute } from "astro"

import { buildLlmsTxt } from "@/lib/llms-txt"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const body = buildLlmsTxt(resolveSiteOrigin())

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}