import { readFormPathsFromMarkdown } from "@/lib/form-markdown-dirs"

/** Paths to audit: home plus each form and thank-you route from form/event markdown. */
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