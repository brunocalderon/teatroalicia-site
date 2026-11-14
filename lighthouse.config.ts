export const lighthouseConfig = {
  minCategoryScore: 90,
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