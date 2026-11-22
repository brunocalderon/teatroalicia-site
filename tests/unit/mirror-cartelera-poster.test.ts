import { readFileSync } from "node:fs"
import { access, rm } from "node:fs/promises"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildMirroredCarteleraPosterFeatureImage } from "@/lib/airtable-cartelera/build-mirrored-cartelera-poster-image"
import {
  CARTELERA_POSTER_PUBLIC_SEGMENT,
  mirrorAirtableCarteleraPoster,
} from "@/lib/airtable-cartelera/mirror-cartelera-poster"

const samplePoster = readFileSync(
  new URL("../../content/events/murano/murano.jpg", import.meta.url),
)

describe("mirror-cartelera-poster", () => {
  const outputDir = path.join(
    process.cwd(),
    "public",
    CARTELERA_POSTER_PUBLIC_SEGMENT,
  )

  beforeEach(async () => {
    await rm(outputDir, { recursive: true, force: true })
  })

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true })
    vi.unstubAllGlobals()
  })

  it("rejects non-Airtable image URLs", async () => {
    await expect(
      mirrorAirtableCarteleraPoster("murano", "https://example.com/poster.jpg"),
    ).resolves.toBeUndefined()
  })

  it("downloads allowed URLs into public/cartelera-posters", async () => {
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
    const mirroredPath = path.join(outputDir, "murano.jpg")
    expect(metadata?.width).toBe(400)
    expect(metadata?.absolutePath).toBe(mirroredPath)
    await access(mirroredPath)

    if (!metadata) {
      throw new Error("expected mirrored metadata")
    }

    const featureImage = await buildMirroredCarteleraPosterFeatureImage(
      "murano",
      metadata.absolutePath,
      metadata.width,
      metadata.height,
    )

    expect(featureImage.src).toBe("/cartelera-posters/murano-400w.webp")
    expect(featureImage.fallbackSrc).toBe("/cartelera-posters/murano-400w.jpg")
    expect(featureImage.zoomSrc).toBe("/cartelera-posters/murano.jpg")
    await access(path.join(outputDir, "murano-400w.jpg"))
  })
})