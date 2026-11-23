import { copyFile, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mockCacheDir = vi.hoisted(() => ({ path: "" }))

vi.mock("@/lib/airtable-cartelera/cartelera-poster-cache-path", () => ({
  get CARTELERA_POSTER_CACHE_DIR() {
    return mockCacheDir.path
  },
}))

import {
  carteleraPosterImageBySlug,
  resetCarteleraPosterFileIndex,
} from "@/lib/airtable-cartelera/cartelera-poster-image-modules"

const samplePosterPath = new URL(
  "../fixtures/cartelera-poster-sample.jpg",
  import.meta.url,
)

describe("carteleraPosterImageBySlug", () => {
  beforeEach(async () => {
    resetCarteleraPosterFileIndex()
    mockCacheDir.path = await mkdtemp(path.join(tmpdir(), "ta-cartelera-poster-"))
    await copyFile(samplePosterPath, path.join(mockCacheDir.path, "ecdlv.jpg"))
  })

  afterEach(async () => {
    resetCarteleraPosterFileIndex()
    if (mockCacheDir.path) {
      await rm(mockCacheDir.path, { recursive: true, force: true })
      mockCacheDir.path = ""
    }
  })

  it("loads mirrored poster metadata from disk when Vite glob is stale", async () => {
    const metadata = await carteleraPosterImageBySlug("ecdlv")
    expect(metadata?.width).toBe(400)
    expect(metadata?.height).toBeGreaterThan(0)
  })
})