/** Non-square cartelera posters use contain + blurred fill in the square frame. */
export function needsLetterboxPosterFill(
  width: number,
  height: number,
): boolean {
  return width > 0 && height > 0 && width !== height
}

/**
 * Blurred fill must not declare its own responsive sources; it copies `main.currentSrc`
 * after the main poster loads (see `home-feature-poster-fill.ts`).
 */
export function letterboxFillMustNotDeclareSources(fill: HTMLImageElement): boolean {
  const src = fill.getAttribute("src")?.trim() ?? ""
  const srcset = fill.getAttribute("srcset")?.trim() ?? ""
  return src === "" && srcset === ""
}

/** Distinct loaded poster URLs inside a letterbox frame (should be 1 after fill sync). */
export function distinctPosterUrlsInFrame(frame: HTMLElement): string[] {
  const urls = new Set<string>()

  for (const img of frame.querySelectorAll<HTMLImageElement>(".home-feature__image")) {
    const src = img.getAttribute("src")?.trim()
    if (src) {
      urls.add(src)
    }
    const currentSrc = img.currentSrc?.trim()
    if (currentSrc) {
      urls.add(currentSrc)
    }
  }

  return [...urls]
}