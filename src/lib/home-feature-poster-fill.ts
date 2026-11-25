import { letterboxFillMustNotDeclareSources } from "@/lib/home-feature-poster-letterbox"

const LETTERBOX_FRAME_SELECTOR = ".home-feature__poster-frame--letterbox"
const FILL_IMG_SELECTOR = "[data-home-feature-poster-fill]"
const MAIN_IMG_SELECTOR = `.home-feature__image:not(${FILL_IMG_SELECTOR})`

export function syncPosterFillFromMain(
  fill: HTMLImageElement,
  main: HTMLImageElement,
): void {
  const resolved = main.currentSrc
  if (!resolved || fill.currentSrc === resolved) {
    return
  }
  fill.removeAttribute("srcset")
  fill.removeAttribute("sizes")
  fill.src = resolved
}

function wireLetterboxPosterFill(frame: HTMLElement): void {
  const fill = frame.querySelector<HTMLImageElement>(FILL_IMG_SELECTOR)
  const main = frame.querySelector<HTMLImageElement>(MAIN_IMG_SELECTOR)
  if (!fill || !main) {
    return
  }

  if (!letterboxFillMustNotDeclareSources(fill)) {
    return
  }

  const sync = () => syncPosterFillFromMain(fill, main)

  if (main.complete) {
    sync()
  } else {
    main.addEventListener("load", sync, { once: true })
  }
}

/** Reuses the main poster's resolved `currentSrc` for the blurred letterbox fill. */
export function initHomeFeaturePosterFill(root: ParentNode = document): void {
  const frames = root.querySelectorAll<HTMLElement>(LETTERBOX_FRAME_SELECTOR)
  for (const frame of frames) {
    wireLetterboxPosterFill(frame)
  }
}