import { describe, expect, it } from "vitest"

import {
  isCarteleraEventVisible,
  isUpcomingEventStart,
} from "@/lib/schema-org/event-datetime"

describe("isCarteleraEventVisible", () => {
  const kissStart = "2026-11-21T22:00:00-03:00"
  const kissEnd = "2026-11-22T04:30:00-03:00"

  it("keeps events visible after start until eventEnd", () => {
    const duringEvent = new Date("2026-11-21T23:30:00-03:00")
    expect(isUpcomingEventStart(kissStart, duringEvent)).toBe(false)
    expect(isCarteleraEventVisible(kissStart, kissEnd, duringEvent)).toBe(true)
  })

  it("hides events after eventEnd", () => {
    const afterEvent = new Date("2026-11-22T05:00:00-03:00")
    expect(isCarteleraEventVisible(kissStart, kissEnd, afterEvent)).toBe(false)
  })

  it("without eventEnd uses upcoming start rule", () => {
    const before = new Date("2026-11-21T21:00:00-03:00")
    const after = new Date("2026-11-21T23:00:00-03:00")
    expect(isCarteleraEventVisible(kissStart, undefined, before)).toBe(true)
    expect(isCarteleraEventVisible(kissStart, undefined, after)).toBe(false)
  })
})