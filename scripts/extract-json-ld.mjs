#!/usr/bin/env node
/**
 * Extract `<script type="application/ld+json">` payloads from built HTML in `dist/`.
 *
 * Usage:
 *   npm run extract:json-ld
 *   npm run extract:json-ld -- --write
 *   npm run extract:json-ld -- dist/index.html dist/i/murano/index.html
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const distDir = path.join(projectRoot, "dist")
const ldJsonRegex =
  /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi

function printUsage() {
  console.error(`Usage: npm run extract:json-ld -- [options] [htmlFiles...]

Options:
  --write    Write pretty JSON under dist/json-ld/ (mirrors page paths)
  --help     Show this help

If no htmlFiles are given, scans all dist/**/*.html files.
Requires an existing dist/ directory (run npm run build first).`)
}

function walkHtmlFiles(directory, results = []) {
  if (!existsSync(directory)) {
    return results
  }
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      walkHtmlFiles(fullPath, results)
    } else if (entry.endsWith(".html")) {
      results.push(fullPath)
    }
  }
  return results
}

function routeKeyFromHtmlFile(htmlFile) {
  const relativePath = path.relative(distDir, htmlFile).replace(/\\/g, "/")
  if (relativePath === "index.html") {
    return "index"
  }
  if (relativePath.endsWith("/index.html")) {
    return relativePath.slice(0, -"/index.html".length)
  }
  return relativePath.replace(/\.html$/, "")
}

function extractLdJsonBlocks(html) {
  const blocks = []
  for (const match of html.matchAll(ldJsonRegex)) {
    const raw = match[1]?.trim()
    if (!raw) {
      continue
    }
    try {
      blocks.push(JSON.parse(raw))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Invalid JSON-LD in HTML: ${message}`)
    }
  }
  return blocks
}

function parseArgs(argv) {
  const write = argv.includes("--write")
  const help = argv.includes("--help") || argv.includes("-h")
  const files = argv.filter(
    (arg) => !arg.startsWith("--") && arg.endsWith(".html"),
  )
  return { write, help, files }
}

const { write, help, files: fileArgs } = parseArgs(process.argv.slice(2))

if (help) {
  printUsage()
  process.exit(0)
}

if (!existsSync(distDir)) {
  console.error(
    'dist/ not found. Run "npm run build" before extracting JSON-LD.',
  )
  process.exit(1)
}

const htmlFiles = fileArgs.length
  ? fileArgs.map((file) => path.resolve(process.cwd(), file))
  : walkHtmlFiles(distDir).sort()

if (htmlFiles.length === 0) {
  console.error("No HTML files found under dist/.")
  process.exit(1)
}

let extractedCount = 0
const outDir = path.join(distDir, "json-ld")

if (write) {
  mkdirSync(outDir, { recursive: true })
}

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8")
  const blocks = extractLdJsonBlocks(html)
  if (blocks.length === 0) {
    continue
  }

  const routeKey = routeKeyFromHtmlFile(htmlFile)
  const payload = blocks.length === 1 ? blocks[0] : blocks
  const pretty = `${JSON.stringify(payload, null, 2)}\n`

  if (write) {
    const outFile = path.join(outDir, `${routeKey}.json`)
    mkdirSync(path.dirname(outFile), { recursive: true })
    writeFileSync(outFile, pretty, "utf8")
    console.error(`Wrote ${path.relative(projectRoot, outFile)}`)
  } else {
    console.log(`=== ${routeKey || path.relative(distDir, htmlFile)} ===`)
    console.log(pretty)
  }

  extractedCount += 1
}

if (extractedCount === 0) {
  console.error("No JSON-LD blocks found in the scanned HTML files.")
  process.exit(1)
}

if (write) {
  console.error(`Extracted JSON-LD from ${extractedCount} page(s).`)
}