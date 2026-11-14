import { spawn, spawnSync, type ChildProcess } from "node:child_process"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { createServer as createNetServer } from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const certDir = path.join(moduleDir, "certs")
const certPath = path.join(certDir, "cert.pem")
const keyPath = path.join(certDir, "key.pem")
const previewHost = "127.0.0.1"

const MIME: Record<string, string> = {
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
  ".csv": "text/csv; charset=utf-8",
}

export async function getAvailablePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createNetServer()
    server.listen(0, previewHost, () => {
      const address = server.address()
      if (!address || typeof address === "string") {
        server.close()
        reject(new Error("Could not allocate preview port"))
        return
      }
      const { port } = address
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(port)
      })
    })
    server.on("error", reject)
  })
}

function ensurePreviewCertificates(): void {
  if (existsSync(certPath) && existsSync(keyPath)) {
    return
  }
  mkdirSync(certDir, { recursive: true })
  const result = spawnSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-keyout",
      keyPath,
      "-out",
      certPath,
      "-days",
      "3650",
      "-nodes",
      "-subj",
      "/CN=localhost",
    ],
    { cwd: certDir, stdio: "inherit" },
  )
  if (result.status !== 0) {
    throw new Error(
      "Failed to generate Lighthouse preview TLS certificates (openssl).",
    )
  }
}

export function spawnHttpsDistPreview(
  distDir: string,
  port: number,
): ChildProcess {
  ensurePreviewCertificates()
  const cert = readFileSync(certPath)
  const key = readFileSync(keyPath)

  const child = spawn(
    process.execPath,
    [path.join(moduleDir, "https-dist-server.mjs")],
    {
      cwd: moduleDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        LIGHTHOUSE_DIST_DIR: distDir,
        LIGHTHOUSE_PREVIEW_HOST: previewHost,
        LIGHTHOUSE_PREVIEW_PORT: String(port),
        LIGHTHOUSE_TLS_CERT: cert.toString("base64"),
        LIGHTHOUSE_TLS_KEY: key.toString("base64"),
      },
    },
  )

  return child
}

export function previewBaseUrl(port: number): string {
  return `https://${previewHost}:${port}`
}

export function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return MIME[ext] ?? "application/octet-stream"
}