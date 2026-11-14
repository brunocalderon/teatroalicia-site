import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

import { buildArdManifest } from "@/lib/ard-manifest"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export const GET: APIRoute = async () => {
  const forms = await getCollection("forms")
  const manifest = buildArdManifest(resolveSiteOrigin(), forms)

  return new Response(JSON.stringify(manifest, null, 2) + "\n", {
    headers: {
      "Content-Type": "application/ard+json; charset=utf-8",
    },
  })
}