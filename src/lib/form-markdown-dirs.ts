import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"

/** Standalone Formgong pages (e.g. contact). */
export const FORM_MARKDOWN_DIRS = ["content/forms"] as const

/** Event listings; optional nested `invitation` → `/i/:slug`. */
export const EVENT_MARKDOWN_DIR = "content/events" as const

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")

type FormFrontmatter = {
  path?: string
  thankYouPath?: string
}

type EventFrontmatter = {
  slug?: string
  invitation?: {
    path?: string
    thankYouPath?: string
  }
}

function defaultThankYouPath(formPath: string): string {
  return `${formPath}/gracias`
}

function defaultInvitationPath(slug: string): string {
  return `/i/${slug}`
}

function listEventMarkdownFiles(eventsRoot: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(eventsRoot, { withFileTypes: true })) {
    const abs = path.join(eventsRoot, entry.name)
    if (entry.isDirectory()) {
      files.push(...listEventMarkdownFiles(abs))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(abs)
    }
  }
  return files
}

/** Public routes from form and event markdown. */
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

  const eventsAbs = path.join(projectRoot, EVENT_MARKDOWN_DIR)
  if (fs.existsSync(eventsAbs)) {
    for (const mdPath of listEventMarkdownFiles(eventsAbs)) {
      const raw = fs.readFileSync(mdPath, "utf8")
      const { data } = matter(raw) as { data: EventFrontmatter }

      if (!data.invitation) {
        continue
      }

      const slug = data.slug?.trim()
      if (!slug) {
        continue
      }

      const invitationPath =
        data.invitation.path?.trim() ?? defaultInvitationPath(slug)
      paths.push(invitationPath)

      const thankYou =
        data.invitation.thankYouPath?.trim() ??
        defaultThankYouPath(invitationPath)
      if (thankYou.startsWith("/") && thankYou !== "/") {
        paths.push(thankYou)
      }
    }
  }

  return paths
}