import { describe, expect, it } from "vitest"

import { readFormgongAttribution } from "@/lib/form-browser-signals"

describe("readFormgongAttribution", () => {
  it("maps UTM params, gclid, referrer, and device", () => {
    const attribution = readFormgongAttribution(
      "?utm_source=meta&utm_medium=cpc&utm_campaign=ecdlv&gclid=abc",
      "https://www.google.com/",
      "/i/ecdlv",
    )
    expect(attribution.utm_source).toBe("meta")
    expect(attribution.utm_medium).toBe("cpc")
    expect(attribution.utm_campaign).toBe("ecdlv")
    expect(attribution.ads).toBe("google")
    expect(attribution.ref).toBe("google.com")
    expect(attribution.landing).toContain("/i/ecdlv")
  })

  it("drops same-host referrer", () => {
    const attribution = readFormgongAttribution(
      "",
      "https://teatroalicia.com/i/ecdlv",
      "/i/ecdlv",
      "teatroalicia.com",
    )
    expect(attribution.ref).toBe("")
  })
})