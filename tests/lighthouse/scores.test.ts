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

    const failingCategories = lighthouseConfig.categories.filter(
      (id) => scores[id] < min,
    )

    const failures = failingCategories.map(
      (id) => `${id}: ${scores[id]} (min ${min})`,
    )

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