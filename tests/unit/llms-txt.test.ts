import { describe, expect, it } from "vitest"

import { buildLlmsTxt } from "@/lib/llms-txt"

describe("buildLlmsTxt", () => {
  it("lists home and robots only", () => {
    const body = buildLlmsTxt("https://teatroalicia.cl")

    expect(body).toMatch(/^# Teatro Alicia\n/)
    expect(body).toContain("https://teatroalicia.cl/")
    expect(body).toContain("https://teatroalicia.cl/robots.txt")
    expect(body).not.toContain("github.com")
    expect(body).not.toContain("/i/murano")
    expect(body).not.toContain("/gracias")
    expect(body).not.toContain("/info/")
  })
})