// @vitest-environment happy-dom

import { describe, expect, it } from "vitest"

import { homeEventPosterLoadingInCarousel } from "@/lib/home-event-poster-loading"
import { distinctPosterUrlsInFrame } from "@/lib/home-feature-poster-letterbox"
import {
  initHomeFeaturePosterFill,
  syncPosterFillFromMain,
} from "@/lib/home-feature-poster-fill"

function buildLetterboxFrame(): HTMLElement {
  const frame = document.createElement("div")
  frame.className =
    "home-feature__poster-frame home-feature__poster-frame--letterbox"
  frame.innerHTML = `
    <img
      data-home-feature-poster-fill
      class="home-feature__image home-feature__image--fill"
      alt=""
      width="1672"
      height="941"
      decoding="async"
    />
    <picture>
      <img
        class="home-feature__image"
        alt="Mandarin"
        src="https://teatroalicia.com/poster-640.jpg"
        srcset="https://teatroalicia.com/poster-640.jpg 640w, https://teatroalicia.com/poster-1280.jpg 1280w"
        sizes="(max-width: 56rem) 7.5rem, 20rem"
        width="1672"
        height="941"
        loading="lazy"
        decoding="async"
      />
    </picture>
  `
  return frame
}

describe("cartelera poster image load", () => {
  it("uses eager loading for translated carousel posters", () => {
    expect(homeEventPosterLoadingInCarousel(true)).toBe("eager")
    expect(homeEventPosterLoadingInCarousel(false)).toBe("lazy")
  })

  it("ships fill img without its own src or srcset (main owns srcset)", () => {
    const frame = buildLetterboxFrame()
    const fill = frame.querySelector<HTMLImageElement>(
      "[data-home-feature-poster-fill]",
    )!

    expect(fill.getAttribute("src")).toBeNull()
    expect(fill.getAttribute("srcset")).toBeNull()
    expect(fill.getAttribute("sizes")).toBeNull()
  })

  it("reuses main currentSrc for blur fill so only one url is loaded", () => {
    const frame = buildLetterboxFrame()
    document.body.appendChild(frame)

    const main = frame.querySelector<HTMLImageElement>(
      ".home-feature__image:not([data-home-feature-poster-fill])",
    )!
    const fill = frame.querySelector<HTMLImageElement>(
      "[data-home-feature-poster-fill]",
    )!

    const resolved = "https://teatroalicia.com/poster-640.jpg"
    Object.defineProperty(main, "complete", { value: true, configurable: true })
    Object.defineProperty(main, "currentSrc", {
      get: () => resolved,
      configurable: true,
    })

    initHomeFeaturePosterFill(document)

    expect(fill?.getAttribute("srcset")).toBeNull()
    expect(fill?.src).toBe("https://teatroalicia.com/poster-640.jpg")
    expect(distinctPosterUrlsInFrame(frame)).toEqual([
      "https://teatroalicia.com/poster-640.jpg",
    ])

    frame.remove()
  })

  it("defers fill src until the main poster fires load", () => {
    const frame = buildLetterboxFrame()
    document.body.appendChild(frame)

    const main = frame.querySelector<HTMLImageElement>(
      ".home-feature__image:not([data-home-feature-poster-fill])",
    )!
    const fill = frame.querySelector<HTMLImageElement>(
      "[data-home-feature-poster-fill]",
    )!

    const resolved = "https://teatroalicia.com/poster-640.jpg"
    let mainResolved = ""
    Object.defineProperty(main, "complete", { value: false, configurable: true })
    Object.defineProperty(main, "currentSrc", {
      get: () => mainResolved,
      configurable: true,
    })

    initHomeFeaturePosterFill(document)
    expect(fill?.getAttribute("src")).toBeNull()

    mainResolved = resolved
    Object.defineProperty(main, "complete", { value: true, configurable: true })
    main.dispatchEvent(new Event("load"))

    expect(fill?.src).toBe("https://teatroalicia.com/poster-640.jpg")
    expect(distinctPosterUrlsInFrame(frame)).toHaveLength(1)

    frame.remove()
  })

  it("does not wire fill when fill already declares a separate src", () => {
    const frame = buildLetterboxFrame()
    const fill = frame.querySelector<HTMLImageElement>(
      "[data-home-feature-poster-fill]",
    )!
    fill.setAttribute("src", "https://teatroalicia.com/other.jpg")

    const main = frame.querySelector<HTMLImageElement>(
      ".home-feature__image:not([data-home-feature-poster-fill])",
    )!
    Object.defineProperty(main, "complete", { value: true, configurable: true })
    Object.defineProperty(main, "currentSrc", {
      get: () => "https://teatroalicia.com/poster-640.jpg",
      configurable: true,
    })

    initHomeFeaturePosterFill(document)

    expect(fill.src).toContain("/other.jpg")
  })
})