import { describe, expect, it } from "vitest"

import {
  displayGuestPassReferralFromSearchParams,
  guestPassReferralFallbackPromoter,
  resolveGuestPassReferralFromSearchParams,
} from "@/lib/promoters"

describe("displayGuestPassReferralFromSearchParams", () => {
  it("returns undefined without e", () => {
    expect(
      displayGuestPassReferralFromSearchParams(new URLSearchParams())
    ).toBeUndefined()
  })

  it("returns matched promoter for eligible e", () => {
    const promoter = displayGuestPassReferralFromSearchParams(
      new URLSearchParams("e=trini-alvarado")
    )
    expect(promoter?.id).toBe("trini-alvarado")
    expect(promoter?.name).toBeTruthy()
  })

  it("returns Teatro Alicia fallback for unknown e", () => {
    const promoter = displayGuestPassReferralFromSearchParams(
      new URLSearchParams("e=not-a-real-promoter")
    )
    expect(promoter).toEqual(guestPassReferralFallbackPromoter)
    expect(
      resolveGuestPassReferralFromSearchParams(
        new URLSearchParams("e=not-a-real-promoter")
      )
    ).toBeUndefined()
  })
})