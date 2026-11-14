import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { createServer } from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { TestProject } from "vitest/node"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")
const distDir = path.join(projectRoot, "dist")
const previewHost = "127.0.0.1"

async function getAvailablePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer()
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

async function waitForHttpOk(
  url: string,
  timeoutMs = 120_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "follow" })
      if (response.ok) {
        return
      }
    } catch {
      // preview still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

function spawnPreview(port: number): ChildProcess {
  return spawn(
    "npx",
    ["astro", "preview", "--host", previewHost, "--port", String(port)],
    {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  )
}

export default async function setup(project: TestProject) {
  const preset = process.env.LIGHTHOUSE_BASE_URL?.trim().replace(/\/$/, "")

  if (preset) {
    project.provide("lighthouseBaseUrl", preset)
    return async () => {}
  }

  if (!existsDist()) {
    throw new Error(
      `Missing ${distDir}. Run \`npm run build\` before Lighthouse tests.`,
    )
  }

  const port = await getAvailablePort()
  const baseUrl = `http://${previewHost}:${port}`
  const preview = spawnPreview(port)

  let previewLog = ""
  preview.stdout?.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString()
  })
  preview.stderr?.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString()
  })

  try {
    await waitForHttpOk(`${baseUrl}/`)
  } catch (error) {
    preview.kill("SIGTERM")
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}\n\nastro preview output:\n${previewLog}`)
  }

  project.provide("lighthouseBaseUrl", baseUrl)

  return async () => {
    if (!preview.killed) {
      preview.kill("SIGTERM")
      await new Promise((resolve) => {
        preview.once("exit", () => resolve(undefined))
        setTimeout(() => {
          if (!preview.killed) {
            preview.kill("SIGKILL")
          }
          resolve(undefined)
        }, 5_000)
      })
    }
  }
}

function existsDist(): boolean {
  return existsSync(distDir)
}