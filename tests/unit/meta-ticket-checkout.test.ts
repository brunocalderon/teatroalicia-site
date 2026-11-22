import { describe, expect, it } from "vitest"

import {
  metaTicketCheckoutContentId,
  resolveTicketPlatformDestination,
} from "@/lib/meta-ticket-checkout"

describe("meta-ticket-checkout", () => {
  it("builds content id from slug and eventId date suffix", () => {
    expect(
      metaTicketCheckoutContentId({
        eventId: "teatro-alicia-murano-one-more-night-2026-11-20",
        slug: "murano",
      }),
    ).toBe("murano-2026-11-20")
  })

  it("falls back to slug without dated eventId", () => {
    expect(metaTicketCheckoutContentId({ slug: "murano" })).toBe("murano")
  })

  it("maps passline URLs to destination passline", () => {
    expect(
      resolveTicketPlatformDestination(
        "https://www.passline.com/eventos/el-club-de-los-viernes",
      ),
    ).toBe("passline")
  })

  it("maps unknown hosts to first label", () => {
    expect(
      resolveTicketPlatformDestination("https://tickets.example.com/show"),
    ).toBe("tickets")
  })
})