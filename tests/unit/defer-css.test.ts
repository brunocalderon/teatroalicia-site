import { describe, expect, it } from "vitest"

import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Mirrors the defer-css integration matcher so noscript fallbacks are not re-deferred.
 * (Full hook runs at build time; this guards the regression that blew up HTML size.)
 */
const STYLESHEET_LINK =
  /<link\s+[^>]*?\brel\s*=\s*(["'])stylesheet\1[^>]*>/gi

function isInsideNoscript(html: string, matchOffset: number): boolean {
  const before = html.slice(0, matchOffset)
  const opens = (before.match(/<noscript\b/gi) ?? []).length
  const closes = (before.match(/<\/noscript>/gi) ?? []).length
  return opens > closes
}

function deferStylesheetsInHtml(
  html: string,
  keepBlockingStylesheetCount = 1,
): string {
  let blockingStylesheetCount = 0
  STYLESHEET_LINK.lastIndex = 0
  return html.replace(STYLESHEET_LINK, (tag, _quote, offset) => {
    if (!isRenderBlockingStylesheetLink(tag)) {
      return tag
    }
    if (isInsideNoscript(html, offset)) {
      return tag
    }
    if (blockingStylesheetCount < keepBlockingStylesheetCount) {
      blockingStylesheetCount += 1
      return tag
    }
    return deferStylesheetLink(tag)
  })
}

function isRenderBlockingStylesheetLink(tag: string): boolean {
  const rel = tag.match(/\brel\s*=\s*(["'])([^"']+)\1/i)?.[2]
  return rel === "stylesheet"
}

function deferStylesheetLink(tag: string): string {
  const href = tag.match(/\bhref\s*=\s*(["'])([^"']+)\1/i)?.[2]
  if (!href) {
    return tag
  }
  return [
    `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
    `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
  ].join("")
}

describe("defer-css noscript guard", () => {
  it("does not nest defer transforms inside noscript fallbacks", () => {
    const input =
      '<link rel="stylesheet" href="/a.css"><link rel="stylesheet" href="/b.css">'
    const once = deferStylesheetsInHtml(input)
    const twice = deferStylesheetsInHtml(once)
    expect(twice).toBe(once)
    expect((twice.match(/<link/g) ?? []).length).toBeLessThanOrEqual(4)

    const formOnce = deferStylesheetsInHtml(input, 0)
    const formTwice = deferStylesheetsInHtml(formOnce, 0)
    expect(formTwice).toBe(formOnce)
  })
})

describe("built invitation HTML", () => {
  it("does not contain runaway duplicated stylesheet tags", () => {
    const htmlPath = path.resolve(
      process.cwd(),
      "dist/i/ecdlv/index.html",
    )
    const html = readFileSync(htmlPath, "utf8")
    const styleLinks = [
      ...html.matchAll(/<link[^>]+>/g),
    ]
      .map((match) => match[0])
      .filter((tag) => /stylesheet|preload.*style/.test(tag))
    expect(
      styleLinks.some(
        (tag) => tag.includes('rel="stylesheet"') || tag.includes('as="style"'),
      ),
    ).toBe(true)
    expect(styleLinks.length).toBeLessThanOrEqual(4)
    expect(html.length).toBeLessThan(120_000)
  })
})