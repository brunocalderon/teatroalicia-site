import { describe, expect, inject, it } from "vitest"

import { getLighthouseAuditPaths } from "@/lib/lighthouse-targets"

import { lighthouseConfig } from "../../lighthouse.config.ts"
import { runLighthouseAudit } from "./lighthouse-audit.ts"

const auditPaths = getLighthouseAuditPaths()

describe("Lighthouse category scores", () => {
  it.each(auditPaths)("meets thresholds for %s", async (pathname) => {
    const baseUrl = inject("lighthouseBaseUrl")
    const url = new URL(pathname, `${baseUrl}/`).href

    const { scores } = await runLighthouseAudit(url)
    const min = lighthouseConfig.minCategoryScore

    const failures = lighthouseConfig.categories
      .filter((id) => scores[id] < min)
      .map((id) => `${id}: ${scores[id]} (min ${min})`)

    expect(
      failures,
      failures.length > 0
        ? `${url}\n${failures.join("\n")}`
        : undefined,
    ).toEqual([])
  })
})