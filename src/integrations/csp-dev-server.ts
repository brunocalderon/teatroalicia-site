import type { Plugin } from "vite"

import { CONTENT_SECURITY_POLICY } from "@/lib/content-security-policy"

/** Mirror production CSP headers during `astro dev`. */
export function cspDevServerPlugin(): Plugin {
  return {
    name: "teatroalicia-csp-dev",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY)
        next()
      })
    },
  }
}