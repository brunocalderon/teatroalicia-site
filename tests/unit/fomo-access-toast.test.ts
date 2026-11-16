import { describe, expect, it } from "vitest"

import {
  formatFomoAccessMessage,
  pickRandomFomoAccessMessage,
} from "@/lib/fomo-access-toast"

describe("fomo-access-toast", () => {
  it("formats the access message", () => {
    expect(formatFomoAccessMessage("Camila", "5 minutos")).toBe(
      "Camila solicitó un acceso hace 5 minutos",
    )
  })

  it("picks distinct random messages in a short run", () => {
    const used = new Set<number>()
    const messages = new Set<string>()
    for (let i = 0; i < 8; i++) {
      messages.add(pickRandomFomoAccessMessage(used))
    }
    expect(messages.size).toBe(8)
    for (const message of messages) {
      expect(message).toMatch(/solicitó un acceso hace /)
    }
  })
})