import { afterEach, describe, expect, it, vi } from "vitest"

import type { FormEntryData } from "@/lib/form-schema"
import { warnFormSchemaOrgFields } from "@/lib/form-schema"

const contactoData = {
  title: "Contacto",
  path: "/contacto",
  token: "fk_test",
  lang: "es",
  submitLabel: "Enviar",
  thankYouPath: "/contacto/gracias",
  organizerIsVenue: false,
  livestackFooter: false,
  thankYouInstagram: false,
  eventKind: "general",
  fields: [
    { name: "email", label: "Email", type: "email" as const, required: true },
  ],
} satisfies FormEntryData

describe("warnFormSchemaOrgFields", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not warn for non-event forms such as contacto", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    warnFormSchemaOrgFields([{ id: "contacto", data: contactoData }])

    expect(warn).not.toHaveBeenCalled()
  })

  it("warns when a guest-list form omits eventStart", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    warnFormSchemaOrgFields([
      {
        id: "murano",
        data: {
          ...contactoData,
          path: "/i/murano",
          thankYouPath: "/i/murano/gracias",
          invitationOnly: true,
          eventId: "teatro-alicia-murano",
        },
      },
    ])

    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain("omits eventStart")
  })
})