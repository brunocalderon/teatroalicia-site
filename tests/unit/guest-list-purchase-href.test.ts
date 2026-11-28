import { describe, expect, it } from "vitest"

import { resolveGuestListPurchaseHref } from "@/lib/guest-list/guest-list-purchase-href"
import { GUEST_LIST_TICKET_UTM_CONTENT } from "@/lib/home-cartelera-utm"

describe("resolveGuestListPurchaseHref", () => {
  it("appends home-style UTM params to external ticket URLs", () => {
    const href = resolveGuestListPurchaseHref({
      path: "/i/ecdlv",
      eventId: "el-club-de-los-viernes-2026-11-27",
      ticketUrl: "https://www.passline.com/eventos/el-club-de-los-viernes",
    })
    expect(href).toBeDefined()
    const url = new URL(href!)
    expect(url.searchParams.get("utm_source")).toBe("teatroalicia_site")
    expect(url.searchParams.get("utm_medium")).toBe("referral")
    expect(url.searchParams.get("utm_campaign")).toBe("el-club-de-los-viernes")
    expect(url.searchParams.get("utm_content")).toBe(GUEST_LIST_TICKET_UTM_CONTENT)
  })

  it("returns undefined when no ticket URL is set", () => {
    expect(
      resolveGuestListPurchaseHref({
        path: "/i/ecdlv",
        eventId: "ecdlv",
      }),
    ).toBeUndefined()
  })
})