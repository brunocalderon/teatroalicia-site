import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { readFormPathsFromMarkdown } from "@/lib/form-markdown-dirs"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(moduleDir, "../../dist")

function collectCmsPathsFromDist(
  absoluteDir: string,
  urlPrefix: string,
): string[] {
  if (!fs.existsSync(absoluteDir)) {
    return []
  }

  const paths: string[] = []
  if (fs.existsSync(path.join(absoluteDir, "index.html"))) {
    paths.push(urlPrefix)
  }

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }
    paths.push(
      ...collectCmsPathsFromDist(
        path.join(absoluteDir, entry.name),
        `${urlPrefix}/${entry.name}`,
      ),
    )
  }

  return paths
}

function sampleBuiltCmsPath(): string | undefined {
  const paths = [
    ...new Set(collectCmsPathsFromDist(path.join(distDir, "info"), "/info")),
  ].sort((a, b) => a.localeCompare(b))

  return paths[0]
}

/** Paths to audit: home plus each form and thank-you route from form/event markdown. */
export function getLighthouseAuditPaths(): string[] {
  const merged = ["/", ...readFormPathsFromMarkdown()]
  const cmsSample = sampleBuiltCmsPath()
  if (cmsSample) {
    merged.push(cmsSample)
  }
  return [...new Set(merged)]
}

export function resolveLighthouseBaseUrl(): string {
  const fromEnv = process.env.LIGHTHOUSE_BASE_URL?.trim()
  if (!fromEnv) {
    throw new Error(
      "LIGHTHOUSE_BASE_URL is not set (Vitest globalSetup or export before running audits)",
    )
  }
  return fromEnv.replace(/\/$/, "")
}