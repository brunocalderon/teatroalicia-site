import { describe, expect, it } from "vitest"

import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

describe("getUmamiPromoterEventData", () => {
  it("returns promoter properties for a valid guest-pass ref", () => {
    const data = getUmamiPromoterEventData(
      new URLSearchParams("e=rodrigo-pichi-quintana")
    )
    expect(data).toEqual({
      promoter_id: "rodrigo-pichi-quintana",
      promoter_name: "Rodrigo Pichi Quintana",
      promoter_verified: true,
    })
  })

  it("returns fallback display name for unknown ref", () => {
    const data = getUmamiPromoterEventData(
      new URLSearchParams("e=not-a-promoter")
    )
    expect(data).toMatchObject({
      promoter_id: "not-a-promoter",
      promoter_name: "Teatro Alicia",
      promoter_verified: false,
    })
  })

  it("returns undefined without e", () => {
    expect(getUmamiPromoterEventData(new URLSearchParams())).toBeUndefined()
  })
})