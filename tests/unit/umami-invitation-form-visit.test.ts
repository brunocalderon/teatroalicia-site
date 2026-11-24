import { describe, expect, it } from "vitest"

import {
  UMAMI_INVITATION_FORM_VISIT_EVENT,
  buildUmamiInvitationFormVisitData,
  buildUmamiInvitationReceivedData,
} from "@/lib/umami-invitation-form-visit"

describe("buildUmamiInvitationFormVisitData", () => {
  it("uses a standardized event name constant", () => {
    expect(UMAMI_INVITATION_FORM_VISIT_EVENT).toBe("Invitation Form Visit")
  })

  it("includes event name and optional id", () => {
    expect(buildUmamiInvitationFormVisitData("La Orquesta", "recABC123")).toEqual(
      {
        event_name: "La Orquesta",
        event_id: "recABC123",
      },
    )
  })

  it("omits event_id when missing", () => {
    expect(buildUmamiInvitationFormVisitData("Contacto")).toEqual({
      event_name: "Contacto",
    })
  })
})

describe("buildUmamiInvitationReceivedData", () => {
  it("always includes event_id", () => {
    expect(buildUmamiInvitationReceivedData("Contacto")).toEqual({
      event_name: "Contacto",
      event_id: "",
    })
    expect(
      buildUmamiInvitationReceivedData("La Orquesta", "recABC123"),
    ).toEqual({
      event_name: "La Orquesta",
      event_id: "recABC123",
    })
  })
})