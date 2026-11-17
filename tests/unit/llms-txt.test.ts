import { describe, expect, it } from "vitest"

import { buildLlmsTxt } from "@/lib/llms-txt"

describe("buildLlmsTxt", () => {
  it("lists home, forms, thank-you pages, and robots link", () => {
    const body = buildLlmsTxt("https://teatroalicia.cl", [
      {
        data: {
          title: "Murano",
          path: "/i/murano",
          thankYouPath: "/i/murano/gracias",
          lang: "es",
        },
      },
    ])

    expect(body).toMatch(/^# Teatro Alicia\n/)
    expect(body).toContain("https://teatroalicia.cl/")
    expect(body).toContain("https://teatroalicia.cl/i/murano")
    expect(body).toContain("https://teatroalicia.cl/i/murano/gracias")
    expect(body).toContain("https://teatroalicia.cl/robots.txt")
    expect(body).toContain("content/events")
  })
})