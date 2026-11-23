import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import * as chromeLauncher from "chrome-launcher"
import lighthouse, { type Result } from "lighthouse"

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
  lhr: Result,
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

type LighthouseReport = {
  categories: Record<
    string,
    { auditRefs: { id: string; weight: number }[] }
  >
  audits: Record<
    string,
    {
      score: number | null
      scoreDisplayMode?: string
      title?: string
    }
  >
}

export function formatFailingCategoryAudits(
  reportJson: string,
  categoryId: LighthouseCategoryId,
): string[] {
  let report: LighthouseReport
  try {
    report = JSON.parse(reportJson) as LighthouseReport
  } catch {
    return []
  }

  const category = report.categories[categoryId]
  if (!category) {
    return []
  }

  const lines: string[] = []
  for (const ref of category.auditRefs) {
    if (ref.weight === 0) {
      continue
    }
    const audit = report.audits[ref.id]
    if (!audit) {
      continue
    }
    if (audit.scoreDisplayMode === "notApplicable") {
      continue
    }
    if (audit.score === null || audit.score >= 1) {
      continue
    }
    lines.push(
      `  - ${categoryId} audit "${ref.id}" (${ref.weight}): ${audit.title ?? ref.id}`,
    )
  }
  return lines
}

function medianRounded(values: number[]): number {
  if (values.length === 0) {
    throw new Error("medianRounded requires at least one value")
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
  }
  return sorted[mid]!
}

async function runSingleLighthouseAudit(url: string): Promise<{
  scores: LighthouseCategoryScores
  reportJson: string
}> {
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

    return { scores, reportJson }
  } finally {
    await chrome.kill()
  }
}

export async function runLighthouseAudit(
  url: string,
): Promise<LighthouseAuditResult> {
  const runs = Math.max(1, lighthouseConfig.auditRuns ?? 1)
  const samples: { scores: LighthouseCategoryScores; reportJson: string }[] = []

  for (let index = 0; index < runs; index++) {
    samples.push(await runSingleLighthouseAudit(url))
  }

  const scores = Object.fromEntries(
    lighthouseConfig.categories.map((id) => [
      id,
      medianRounded(samples.map((sample) => sample.scores[id])),
    ]),
  ) as LighthouseCategoryScores

  const medianPerformance = scores.performance
  const reportJson =
    samples.find((sample) => sample.scores.performance === medianPerformance)
      ?.reportJson ?? samples[samples.length - 1]!.reportJson

  return { url, scores, reportJson }
}