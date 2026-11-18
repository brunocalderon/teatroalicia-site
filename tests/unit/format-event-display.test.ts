import { describe, expect, it } from "vitest"

import {
  formatEventDateHome,
  formatEventDateLong,
  formatEventTimeRange,
} from "@/lib/format-event-display"

describe("format-event-display", () => {
  it("formats murano start in es-CL Santiago", () => {
    const iso = "2026-11-20T21:00:00-03:00"
    expect(formatEventDateLong(iso)).toMatch(/noviembre/i)
    expect(formatEventDateLong(iso)).toMatch(/2026/)
    expect(formatEventDateHome(iso)).toBe("Vie, 20 de Nov de 2026")
    expect(formatEventTimeRange(iso, "2026-11-21T02:00:00-03:00")).toContain(
      "21:00",
    )
  })
})