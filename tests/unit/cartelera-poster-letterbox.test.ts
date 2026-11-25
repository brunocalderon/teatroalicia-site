// @vitest-environment happy-dom

import { describe, expect, it } from "vitest"

import {
  distinctPosterUrlsInFrame,
  letterboxFillMustNotDeclareSources,
  needsLetterboxPosterFill,
} from "@/lib/home-feature-poster-letterbox"

describe("needsLetterboxPosterFill", () => {
  it("is false for square posters", () => {
    expect(needsLetterboxPosterFill(1170, 1170)).toBe(false)
    expect(needsLetterboxPosterFill(800, 800)).toBe(false)
  })

  it("is true for landscape and portrait posters", () => {
    expect(needsLetterboxPosterFill(1672, 941)).toBe(true)
    expect(needsLetterboxPosterFill(1170, 1463)).toBe(true)
  })

  it("is false when dimensions are missing", () => {
    expect(needsLetterboxPosterFill(0, 941)).toBe(false)
    expect(needsLetterboxPosterFill(100, 0)).toBe(false)
  })
})

describe("letterboxFillMustNotDeclareSources", () => {
  it("requires empty src and srcset on the fill img", () => {
    const fill = document.createElement("img")
    expect(letterboxFillMustNotDeclareSources(fill)).toBe(true)

    fill.setAttribute("src", "/poster.jpg")
    expect(letterboxFillMustNotDeclareSources(fill)).toBe(false)

    fill.removeAttribute("src")
    fill.setAttribute("srcset", "/poster-640.jpg 640w")
    expect(letterboxFillMustNotDeclareSources(fill)).toBe(false)
  })
})

describe("distinctPosterUrlsInFrame", () => {
  it("counts one url when main and fill share the same resolved source", () => {
    const frame = document.createElement("div")
    frame.innerHTML = `
      <img
        class="home-feature__image home-feature__image--fill"
        src="https://teatroalicia.com/poster-640.jpg"
      />
      <img
        class="home-feature__image"
        src="https://teatroalicia.com/poster-640.jpg"
        srcset="https://teatroalicia.com/poster-640.jpg 640w, https://teatroalicia.com/poster-1280.jpg 1280w"
      />
    `

    expect(distinctPosterUrlsInFrame(frame)).toEqual([
      "https://teatroalicia.com/poster-640.jpg",
    ])
  })
})