import { readFileSync } from "node:fs"
import { access, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mockCacheDir = vi.hoisted(() => ({ path: "" }))

vi.mock("@/lib/airtable-cartelera/cartelera-poster-cache-path", () => ({
  get CARTELERA_POSTER_CACHE_DIR() {
    return mockCacheDir.path
  },
}))

import { mirrorAirtableCarteleraPoster } from "@/lib/airtable-cartelera/mirror-cartelera-poster"

const samplePoster = readFileSync(
  new URL("../fixtures/cartelera-poster-sample.jpg", import.meta.url),
)

describe("mirror-cartelera-poster", () => {
  beforeEach(async () => {
    mockCacheDir.path = await mkdtemp(path.join(tmpdir(), "ta-cartelera-mirror-"))
  })

  afterEach(async () => {
    if (mockCacheDir.path) {
      await rm(mockCacheDir.path, { recursive: true, force: true })
      mockCacheDir.path = ""
    }
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
    const mirroredPath = path.join(mockCacheDir.path, "murano.jpg")
    expect(metadata?.width).toBe(400)
    expect(metadata?.absolutePath).toBe(mirroredPath)
    await access(mirroredPath)
  })
})