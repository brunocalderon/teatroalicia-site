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
          const transformed = original.replace(
            STYLESHEET_LINK,
            (tag) => deferStylesheetLink(tag),
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