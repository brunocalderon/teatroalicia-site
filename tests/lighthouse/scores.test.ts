import { describe, expect, inject, it } from "vitest"

import { getLighthouseAuditPaths } from "@/lib/lighthouse-targets"

import {
  lighthouseConfig,
  type LighthouseCategoryId,
} from "../../lighthouse.config.ts"
import {
  formatFailingCategoryAudits,
  runLighthouseAudit,
} from "./lighthouse-audit.ts"

const auditPaths = getLighthouseAuditPaths()

describe("Lighthouse category scores", () => {
  it.each(auditPaths)("meets thresholds for %s", async (pathname) => {
    const baseUrl = inject("lighthouseBaseUrl")
    const url = new URL(pathname, `${baseUrl}/`).href

    const { scores, reportJson } = await runLighthouseAudit(url)
    const min = lighthouseConfig.minCategoryScore

    const minPerformance =
      "minPerformanceScore" in lighthouseConfig
        ? lighthouseConfig.minPerformanceScore
        : min

    const failingCategories = lighthouseConfig.categories.filter((id) => {
      if (id === "performance" && minPerformance > min) {
        return scores[id] < minPerformance
      }
      return scores[id] < min
    })

    const failures = failingCategories.map((id) => {
      const floor =
        id === "performance" && minPerformance > min ? minPerformance : min
      return `${id}: ${scores[id]} (min ${floor})`
    })

    const auditHints = failingCategories.flatMap((categoryId) =>
      formatFailingCategoryAudits(
        reportJson,
        categoryId as LighthouseCategoryId,
      ),
    )

    expect(
      failures,
      failures.length > 0
        ? [url, ...failures, ...auditHints].join("\n")
        : undefined,
    ).toEqual([])
  })
})