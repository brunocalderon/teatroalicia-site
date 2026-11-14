import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import * as chromeLauncher from "chrome-launcher"
import lighthouse from "lighthouse"

import {
  lighthouseConfig,
  type LighthouseCategoryId,
} from "../../lighthouse.config.ts"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")

export type LighthouseCategoryScores = Record<LighthouseCategoryId, number>

export type LighthouseAuditResult = {
  url: string
  scores: LighthouseCategoryScores
  reportJson: string
}

function categoryScorePercent(
  lhr: Awaited<ReturnType<typeof lighthouse>>["lhr"],
  categoryId: LighthouseCategoryId,
): number {
  const category = lhr.categories[categoryId]
  const raw = category?.score
  if (raw == null) {
    throw new Error(`Lighthouse did not return category "${categoryId}"`)
  }
  return Math.round(raw * 100)
}

function sanitizePathForReport(url: string): string {
  try {
    const { pathname } = new URL(url)
    if (pathname === "/") {
      return "home"
    }
    return pathname.replace(/^\//, "").replaceAll("/", "_")
  } catch {
    return "audit"
  }
}

function maybeSaveReport(url: string, reportJson: string): void {
  if (!lighthouseConfig.saveReports) {
    return
  }

  const reportsDir = path.join(projectRoot, lighthouseConfig.reportsDir)
  mkdirSync(reportsDir, { recursive: true })
  const stamp = new Date().toISOString().replaceAll(":", "-")
  const slug = sanitizePathForReport(url)
  writeFileSync(
    path.join(reportsDir, `${slug}-${stamp}.json`),
    reportJson,
    "utf8",
  )
}

export async function runLighthouseAudit(
  url: string,
): Promise<LighthouseAuditResult> {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [...lighthouseConfig.chromeFlags],
  })

  try {
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      port: chrome.port,
      onlyCategories: [...lighthouseConfig.categories],
      formFactor: "mobile" as const,
      screenEmulation: { mobile: true },
    }

    const runnerResult = await lighthouse(url, options)
    if (!runnerResult) {
      throw new Error(`Lighthouse returned no result for ${url}`)
    }

    const reportJson = runnerResult.report
    if (typeof reportJson !== "string") {
      throw new Error(`Unexpected Lighthouse report format for ${url}`)
    }

    maybeSaveReport(url, reportJson)

    const scores = Object.fromEntries(
      lighthouseConfig.categories.map((id) => [
        id,
        categoryScorePercent(runnerResult.lhr, id),
      ]),
    ) as LighthouseCategoryScores

    return { url, scores, reportJson }
  } finally {
    await chrome.kill()
  }
}