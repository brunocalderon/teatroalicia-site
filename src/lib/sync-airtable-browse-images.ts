import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  airtableAssetPublicPath,
  airtableAssetsRootDir,
  sanitizeAirtableAssetFilename,
} from "@/lib/airtable-asset-path"
import type { AirtableFieldSet } from "@/lib/map-airtable-cms-page"
import {
  parseAirtableAttachmentField,
  resolveAirtableBrowseImage,
} from "@/lib/parse-airtable-attachment-field"

export type SyncedAirtableBrowseImage = {
  imagePath: string
  imageAlt: string
}

export async function resetAirtableAssetsDir(cwd = process.cwd()): Promise<void> {
  const root = airtableAssetsRootDir(cwd)
  await rm(root, { recursive: true, force: true })
  await mkdir(root, { recursive: true })
}

async function downloadAirtableAttachment(
  url: string,
  destPath: string,
): Promise<void> {
  const response = await fetch(url, {
    headers: { Accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length === 0) {
    throw new Error("empty response body")
  }

  await mkdir(path.dirname(destPath), { recursive: true })
  await writeFile(destPath, bytes)
}

/** Fetches the row's `Image` attachment and writes `public/airtable-assets/{slug}/…`. */
export async function syncAirtableBrowseImageForRecord(
  slug: string,
  fields: AirtableFieldSet,
  cwd = process.cwd(),
): Promise<SyncedAirtableBrowseImage | undefined> {
  const attachment = resolveAirtableBrowseImage(fields)
  if (!attachment) {
    return undefined
  }

  const filename = sanitizeAirtableAssetFilename(attachment.filename)
  const publicPath = airtableAssetPublicPath(slug, filename)
  const absolutePath = path.join(
    airtableAssetsRootDir(cwd),
    slug,
    filename,
  )

  await downloadAirtableAttachment(attachment.url, absolutePath)

  return {
    imagePath: publicPath,
    imageAlt: attachment.filename,
  }
}

export function patchFieldsJsonWithLocalImage(
  fieldsJson: string,
  imagePath: string,
): string {
  let fields: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(fieldsJson)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return fieldsJson
    }
    fields = { ...(parsed as Record<string, unknown>) }
  } catch {
    return fieldsJson
  }

  const imageKey = Object.keys(fields).find(
    (key) => key.toLowerCase() === "image",
  )
  if (!imageKey) {
    return fieldsJson
  }

  const attachments = parseAirtableAttachmentField(fields[imageKey])
  const first = attachments[0]
  const label = first?.filename ?? "image"
  fields[imageKey] = `${label} (${imagePath})`
  return JSON.stringify(fields)
}