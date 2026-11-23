import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"

/** Standalone Formgong pages (e.g. contact). */
export const FORM_MARKDOWN_DIRS = ["content/forms"] as const

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")

type FormFrontmatter = {
  path?: string
  thankYouPath?: string
}

function defaultThankYouPath(formPath: string): string {
  return `${formPath}/gracias`
}

/** Public routes from form markdown. Guest-list `/i/:slug` routes come from Airtable at build. */
export function readFormPathsFromMarkdown(): string[] {
  const paths: string[] = []

  for (const dir of FORM_MARKDOWN_DIRS) {
    const abs = path.join(projectRoot, dir)
    if (!fs.existsSync(abs)) {
      continue
    }

    for (const name of fs.readdirSync(abs)) {
      if (!name.endsWith(".md")) {
        continue
      }

      const raw = fs.readFileSync(path.join(abs, name), "utf8")
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
  }

  return paths
}