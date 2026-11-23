import { copyFile, mkdir, rm } from "node:fs/promises"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { CARTELERA_POSTER_CACHE_DIR } from "@/lib/airtable-cartelera/cartelera-poster-cache-path"
import {
  carteleraPosterImageBySlug,
  resetCarteleraPosterFileIndex,
} from "@/lib/airtable-cartelera/cartelera-poster-image-modules"

const samplePosterPath = new URL(
  "../fixtures/cartelera-poster-sample.jpg",
  import.meta.url,
)

const TEST_SLUG = "vitest-cartelera-poster-slug"

describe("carteleraPosterImageBySlug", () => {
  const mirroredPosterPath = path.join(
    CARTELERA_POSTER_CACHE_DIR,
    `${TEST_SLUG}.jpg`,
  )

  beforeEach(async () => {
    resetCarteleraPosterFileIndex()
    await mkdir(CARTELERA_POSTER_CACHE_DIR, { recursive: true })
    await copyFile(samplePosterPath, mirroredPosterPath)
  })

  afterEach(async () => {
    resetCarteleraPosterFileIndex()
    await rm(mirroredPosterPath, { force: true })
  })

  it("loads mirrored poster metadata from disk when Vite glob is stale", async () => {
    const metadata = await carteleraPosterImageBySlug(TEST_SLUG)
    expect(metadata?.width).toBe(400)
    expect(metadata?.height).toBeGreaterThan(0)
  })
})