import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchAirtableRecords } from "@/lib/fetch-airtable-records"

describe("fetch-airtable-records", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("adds view when set on cartelera options", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url).toContain("view=viwTestView")
      expect(url).toContain("cellFormat=string")
      return new Response(JSON.stringify({ records: [] }), { status: 200 })
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchAirtableRecords({
      token: "pat",
      baseId: "appBase",
      tableId: "tblHome",
      cellFormat: "string",
      timeZone: "America/Santiago",
      userLocale: "es_CL",
      view: "viwTestView",
    })

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("omits view when empty", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url).not.toContain("view=")
      return new Response(JSON.stringify({ records: [] }), { status: 200 })
    })
    vi.stubGlobal("fetch", fetchMock)

    await fetchAirtableRecords({
      token: "pat",
      baseId: "appBase",
      tableId: "tblHome",
      view: "   ",
    })

    expect(fetchMock).toHaveBeenCalledOnce()
  })
})