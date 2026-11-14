import { type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { TestProject } from "vitest/node"

import {
  getAvailablePort,
  previewBaseUrl,
  spawnHttpsDistPreview,
} from "./preview-server.ts"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")
const distDir = path.join(projectRoot, "dist")

async function waitForHttpsOk(
  url: string,
  timeoutMs = 120_000,
): Promise<void> {
  const previousTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  const deadline = Date.now() + timeoutMs

  try {
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
  } finally {
    if (previousTls === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTls
    }
  }
}

export default async function setup(project: TestProject) {
  const preset = process.env.LIGHTHOUSE_BASE_URL?.trim().replace(/\/$/, "")

  if (preset) {
    project.provide("lighthouseBaseUrl", preset)
    return async () => {}
  }

  if (!existsSync(distDir)) {
    throw new Error(
      `Missing ${distDir}. Run \`npm run build\` before Lighthouse tests.`,
    )
  }

  const port = await getAvailablePort()
  const baseUrl = previewBaseUrl(port)
  const preview = spawnHttpsDistPreview(distDir, port)

  let previewLog = ""
  preview.stdout?.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString()
  })
  preview.stderr?.on("data", (chunk: Buffer) => {
    previewLog += chunk.toString()
  })

  try {
    await waitForHttpsOk(`${baseUrl}/`)
  } catch (error) {
    preview.kill("SIGTERM")
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message}\n\nHTTPS preview output:\n${previewLog}`)
  }

  project.provide("lighthouseBaseUrl", baseUrl)

  return async () => {
    await stopPreview(preview)
  }
}

async function stopPreview(preview: ChildProcess): Promise<void> {
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