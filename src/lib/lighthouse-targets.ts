import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")
const formsDir = path.join(projectRoot, "content/forms")

type FormFrontmatter = {
  path?: string
  thankYouPath?: string
}

function defaultThankYouPath(formPath: string): string {
  return `${formPath}/gracias`
}

function readFormPathsFromMarkdown(): string[] {
  if (!fs.existsSync(formsDir)) {
    return []
  }

  const paths: string[] = []

  for (const name of fs.readdirSync(formsDir)) {
    if (!name.endsWith(".md")) {
      continue
    }

    const raw = fs.readFileSync(path.join(formsDir, name), "utf8")
    const { data } = matter(raw) as { data: FormFrontmatter }

    const formPath = data.path?.trim()
    if (!formPath?.startsWith("/") || formPath === "/") {
      continue
    }

    paths.push(formPath)

    const thankYou =
      data.thankYouPath?.trim() ?? defaultThankYouPath(formPath)
    if (thankYou.startsWith("/") && thankYou !== "/") {
      paths.push(thankYou)
    }
  }

  return paths
}

/** Paths to audit: home plus each form and thank-you route from `content/forms/`. */
export function getLighthouseAuditPaths(): string[] {
  const merged = ["/", ...readFormPathsFromMarkdown()]
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