import { spawn, type ChildProcess } from "node:child_process"
import { createServer as createNetServer } from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const previewHost = "127.0.0.1"

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

export function spawnHttpDistPreview(
  distDir: string,
  port: number,
): ChildProcess {
  const child = spawn(
    process.execPath,
    [path.join(moduleDir, "http-dist-server.mjs")],
    {
      cwd: moduleDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        LIGHTHOUSE_DIST_DIR: distDir,
        LIGHTHOUSE_PREVIEW_HOST: previewHost,
        LIGHTHOUSE_PREVIEW_PORT: String(port),
      },
    },
  )

  return child
}

export function previewBaseUrl(port: number): string {
  return `http://${previewHost}:${port}`
}