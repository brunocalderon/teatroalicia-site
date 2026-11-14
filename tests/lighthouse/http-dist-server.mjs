import { createServer } from "node:http"
import { createReadStream, existsSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const distDir = process.env.LIGHTHOUSE_DIST_DIR
const host = process.env.LIGHTHOUSE_PREVIEW_HOST ?? "127.0.0.1"
const port = Number(process.env.LIGHTHOUSE_PREVIEW_PORT ?? "0")

if (!distDir) {
  throw new Error("LIGHTHOUSE_DIST_DIR is required")
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/text; charset=utf-8",
}

function resolveFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/")
  let relative = decoded.replace(/^\/+/, "")
  if (!relative || relative.endsWith("/")) {
    relative = `${relative}index.html`
  }
  const filePath = join(distDir, relative)
  if (!filePath.startsWith(distDir)) {
    return undefined
  }
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath
  }
  const htmlPath = `${filePath.replace(/\/$/, "")}/index.html`
  if (existsSync(htmlPath)) {
    return htmlPath
  }
  return undefined
}

const server = createServer((req, res) => {
  const filePath = resolveFilePath(req.url ?? "/")
  if (!filePath) {
    res.writeHead(404)
    res.end("Not found")
    return
  }

  const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream"
  res.writeHead(200, { "Content-Type": type })
  createReadStream(filePath).pipe(res)
})

server.listen(port, host, () => {
  process.stdout.write(`listening\n`)
})