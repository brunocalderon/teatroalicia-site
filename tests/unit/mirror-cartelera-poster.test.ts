import { readFileSync } from "node:fs"
import { access, rm } from "node:fs/promises"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CARTELERA_POSTER_CACHE_DIR } from "@/lib/airtable-cartelera/cartelera-poster-cache-path"
import { mirrorAirtableCarteleraPoster } from "@/lib/airtable-cartelera/mirror-cartelera-poster"

const samplePoster = readFileSync(
  new URL("../../content/events/murano/murano.jpg", import.meta.url),
)

describe("mirror-cartelera-poster", () => {
  beforeEach(async () => {
    await rm(CARTELERA_POSTER_CACHE_DIR, { recursive: true, force: true })
  })

  afterEach(async () => {
    await rm(CARTELERA_POSTER_CACHE_DIR, { recursive: true, force: true })
    vi.unstubAllGlobals()
  })

  it("rejects non-Airtable image URLs", async () => {
    await expect(
      mirrorAirtableCarteleraPoster("murano", "https://example.com/poster.jpg"),
    ).resolves.toBeUndefined()
  })

  it("downloads allowed URLs into the build cache under src", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(samplePoster, {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const metadata = await mirrorAirtableCarteleraPoster(
      "murano",
      "https://v5.airtableusercontent.com/v3/example/murano.jpg",
      "murano.jpg",
    )

    expect(fetchMock).toHaveBeenCalledOnce()
    const mirroredPath = path.join(CARTELERA_POSTER_CACHE_DIR, "murano.jpg")
    expect(metadata?.width).toBe(400)
    expect(metadata?.absolutePath).toBe(mirroredPath)
    await access(mirroredPath)
  })
})