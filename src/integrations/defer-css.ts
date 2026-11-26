import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"

const STYLESHEET_LINK =
  /<link\s+[^>]*?\brel\s*=\s*(["'])stylesheet\1[^>]*>/gi

function hrefFromLinkTag(tag: string): string | undefined {
  const match = tag.match(/\bhref\s*=\s*(["'])([^"']+)\1/i)
  return match?.[2]
}

function isRenderBlockingStylesheetLink(tag: string): boolean {
  const rel = tag.match(/\brel\s*=\s*(["'])([^"']+)\1/i)?.[2]
  return rel === "stylesheet"
}

function deferStylesheetLink(tag: string): string {
  const href = hrefFromLinkTag(tag)
  if (!href) {
    return tag
  }

  return [
    `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
    `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
  ].join("")
}

function isInsideNoscript(html: string, matchOffset: number): boolean {
  const before = html.slice(0, matchOffset)
  const opens = (before.match(/<noscript\b/gi) ?? []).length
  const closes = (before.match(/<\/noscript>/gi) ?? []).length
  return opens > closes
}

async function listHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listHtmlFiles(fullPath)))
      continue
    }
    if (entry.name.endsWith(".html")) {
      files.push(fullPath)
    }
  }

  return files
}

/** After static build, load Astro page CSS without render-blocking `<link rel="stylesheet">`. */
export function deferCssIntegration(): AstroIntegration {
  return {
    name: "teatroalicia-defer-css",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir)
        const htmlFiles = await listHtmlFiles(distDir)
        let updated = 0

        for (const filePath of htmlFiles) {
          const original = await readFile(filePath, "utf8")
          if (original.includes('class="form-page')) {
            continue
          }
          const keepBlockingStylesheetCount = 1
          let blockingStylesheetCount = 0
          STYLESHEET_LINK.lastIndex = 0
          const transformed = original.replace(
            STYLESHEET_LINK,
            (tag, _quote, offset) => {
              if (!isRenderBlockingStylesheetLink(tag)) {
                return tag
              }
              if (isInsideNoscript(original, offset)) {
                return tag
              }
              if (blockingStylesheetCount < keepBlockingStylesheetCount) {
                blockingStylesheetCount += 1
                return tag
              }
              return deferStylesheetLink(tag)
            },
          )
          if (transformed !== original) {
            await writeFile(filePath, transformed, "utf8")
            updated += 1
          }
        }

        if (updated > 0) {
          logger.info(
            `Deferred render-blocking stylesheets in ${updated} HTML file(s).`,
          )
        }
      },
    },
  }
}