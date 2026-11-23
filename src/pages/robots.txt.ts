import type { APIRoute } from "astro"

export const prerender = true

export const GET: APIRoute = async () => {
  const body = ["User-agent: *", "Allow: /", ""].join("\n")

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}