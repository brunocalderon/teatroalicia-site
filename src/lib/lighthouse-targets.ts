import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(moduleDir, "../../dist")

/** Guest-list form pages only (`/i/{slug}`), not thank-you or other nested routes. */
function collectBuiltInvitationFormPaths(): string[] {
  const invitationDir = path.join(distDir, "i")
  if (!fs.existsSync(invitationDir)) {
    return []
  }

  const paths: string[] = []
  for (const entry of fs.readdirSync(invitationDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }
    const indexHtml = path.join(invitationDir, entry.name, "index.html")
    if (fs.existsSync(indexHtml)) {
      paths.push(`/i/${entry.name}`)
    }
  }

  return paths.sort((a, b) => a.localeCompare(b))
}

/** Paths to audit: home (`/`) and built guest-list forms (`/i/{slug}`). */
export function getLighthouseAuditPaths(): string[] {
  return ["/", ...collectBuiltInvitationFormPaths()]
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