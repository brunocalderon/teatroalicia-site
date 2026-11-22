import { imageMetadata as readImageMetadata } from "astro/assets/utils"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

export const CARTELERA_POSTER_PUBLIC_SEGMENT = "cartelera-posters"

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
])

export type MirroredCarteleraPoster = {
  absolutePath: string
  width: number
  height: number
}

function carteleraPosterRoot(): string {
  return path.join(process.cwd(), "public", CARTELERA_POSTER_PUBLIC_SEGMENT)
}

function isAllowedAirtableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith("airtableusercontent.com")
    )
  } catch {
    return false
  }
}

function extensionFromFilename(filename: string | undefined): string {
  if (!filename?.trim()) {
    return "jpg"
  }
  const ext = path.extname(filename).slice(1).toLowerCase()
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return "jpg"
  }
  return ext === "jpeg" ? "jpg" : ext
}

function extensionFromContentType(contentType: string | null): string | undefined {
  if (!contentType) {
    return undefined
  }
  const normalized = contentType.split(";")[0]?.trim().toLowerCase()
  switch (normalized) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    case "image/avif":
      return "avif"
    default:
      return undefined
  }
}

export async function mirrorAirtableCarteleraPoster(
  slug: string,
  remoteUrl: string,
  filename?: string,
): Promise<MirroredCarteleraPoster | undefined> {
  const trimmedUrl = remoteUrl.trim()
  if (!trimmedUrl || !isAllowedAirtableImageUrl(trimmedUrl)) {
    return undefined
  }

  const response = await fetch(trimmedUrl)
  if (!response.ok) {
    throw new Error(
      `Failed to mirror cartelera poster for "${slug}" (${response.status})`,
    )
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const extension =
    extensionFromContentType(response.headers.get("content-type")) ??
    extensionFromFilename(filename)

  const outputDir = carteleraPosterRoot()
  await mkdir(outputDir, { recursive: true })

  const absolutePath = path.join(outputDir, `${slug}.${extension}`)
  await writeFile(absolutePath, buffer)

  const dimensions = await readImageMetadata(buffer, absolutePath)

  return {
    absolutePath,
    width: dimensions.width,
    height: dimensions.height,
  }
}

export async function mirrorAirtableCarteleraPosters(
  rows: Iterable<AirtableCarteleraRow>,
): Promise<Map<string, MirroredCarteleraPoster>> {
  const posters = new Map<string, MirroredCarteleraPoster>()

  await Promise.all(
    [...rows].map(async (row) => {
      const remoteUrl = row.imageUrl?.trim()
      if (!remoteUrl) {
        return
      }
      const mirrored = await mirrorAirtableCarteleraPoster(
        row.slug,
        remoteUrl,
        row.imageFilename,
      )
      if (mirrored) {
        posters.set(row.slug, mirrored)
      }
    }),
  )

  return posters
}