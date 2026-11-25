// @vitest-environment happy-dom

import { describe, expect, it } from "vitest"

import { syncPosterFillFromMain } from "@/lib/home-feature-poster-fill"

describe("syncPosterFillFromMain", () => {
  it("sets fill src to the main image currentSrc and drops srcset", () => {
    const fill = document.createElement("img")
    fill.setAttribute("srcset", "/poster-640.jpg 640w")
    fill.setAttribute("sizes", "20rem")
    const main = {
      currentSrc: "https://teatroalicia.com/poster-640.jpg",
    } as HTMLImageElement

    syncPosterFillFromMain(fill, main)

    expect(fill.src).toBe("https://teatroalicia.com/poster-640.jpg")
    expect(fill.getAttribute("srcset")).toBeNull()
    expect(fill.getAttribute("sizes")).toBeNull()
  })

  it("is idempotent when currentSrc is unchanged", () => {
    const fill = document.createElement("img")
    fill.src = "https://teatroalicia.com/poster-640.jpg"
    Object.defineProperty(fill, "currentSrc", {
      value: "https://teatroalicia.com/poster-640.jpg",
      configurable: true,
    })
    const main = {
      currentSrc: "https://teatroalicia.com/poster-640.jpg",
    } as HTMLImageElement

    syncPosterFillFromMain(fill, main)

    expect(fill.src).toBe("https://teatroalicia.com/poster-640.jpg")
  })

  it("skips when main has no resolved source", () => {
    const fill = document.createElement("img")
    const main = { currentSrc: "" } as HTMLImageElement

    syncPosterFillFromMain(fill, main)

    expect(fill.getAttribute("src")).toBeNull()
  })
})