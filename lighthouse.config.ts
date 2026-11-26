export const lighthouseConfig = {
  /** Repeat audits per URL and assert on the median score (reduces mobile perf flakiness). */
  auditRuns: 5,
  minCategoryScore: 90,
  /** Stricter mobile performance regression guard (TBT / CLS). */
  minPerformanceScore: 100,
  categories: [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ] as const,
  chromeFlags: ["--headless=new", "--disable-gpu", "--no-sandbox"] as const,
  saveReports: true,
  reportsDir: "tests/lighthouse/reports",
} as const

export type LighthouseCategoryId = (typeof lighthouseConfig.categories)[number]