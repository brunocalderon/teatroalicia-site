import { describe, expect, it } from "vitest"

import {
  metaTicketCheckoutContentId,
  resolveTicketCheckoutDestination,
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

  it("prefers Airtable Ticket Supplier over URL host", () => {
    expect(
      resolveTicketCheckoutDestination(
        "https://www.passline.com/eventos/show",
        "livepass",
      ),
    ).toBe("livepass")
  })

  it("falls back to URL host when Ticket Supplier is empty", () => {
    expect(
      resolveTicketCheckoutDestination(
        "https://www.passline.com/eventos/show",
        "  ",
      ),
    ).toBe("passline")
  })
})