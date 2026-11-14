import { type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { TestProject } from "vitest/node"

import {
  getAvailablePort,
  previewBaseUrl,
  spawnHttpDistPreview,
} from "./preview-server.ts"

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(moduleDir, "../..")
const distDir = path.join(projectRoot, "dist")

async function waitForHttpOk(url: string, timeoutMs = 120_000): Promise<void> {
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
  const preview = spawnHttpDistPreview(distDir, port)

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
    throw new Error(`${message}\n\nHTTP preview output:\n${previewLog}`)
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