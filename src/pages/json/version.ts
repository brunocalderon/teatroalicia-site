import type { APIRoute } from "astro"

import packageJson from "../../../package.json"

export const prerender = true

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ version: packageJson.version }) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  })
}