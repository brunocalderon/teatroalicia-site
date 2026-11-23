import { describe, expect, it } from "vitest"

import {
  defaultGuestPassReferralField,
  ensureGuestPassReferralField,
} from "@/lib/guest-pass-referral-field"

describe("ensureGuestPassReferralField", () => {
  it("appends default referral when missing", () => {
    expect(ensureGuestPassReferralField([])).toEqual([
      defaultGuestPassReferralField,
    ])
  })

  it("keeps existing referral field", () => {
    const custom = {
      name: "referral_id",
      label: "Referral",
      type: "referral" as const,
      required: false,
    }
    expect(ensureGuestPassReferralField([custom])).toEqual([custom])
  })
})