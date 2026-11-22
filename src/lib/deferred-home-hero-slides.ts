/** Extract `url(...)` hrefs from a CSS `image-set` / `url()` custom-property value. */
export function urlsFromHeroHdBackground(hdBackground: string): string[] {
  const urls: string[] = []
  const pattern = /url\(\s*["']?([^"')]+)["']?\s*\)/g
  let match = pattern.exec(hdBackground)
  while (match) {
    urls.push(match[1])
    match = pattern.exec(hdBackground)
  }
  return urls
}

function warmHeroHdBackground(hdBackground: string) {
  for (const url of urlsFromHeroHdBackground(hdBackground)) {
    const image = new Image()
    image.decoding = "async"
    image.src = url
  }
}

/**
 * Applies HD carousel layers for slides 2–4 (SSR leaves LQIP only).
 * Staggered so each layer starts loading before its fade-in (~5s / 10s / 15s in the 20s loop).
 */
export function initDeferredHomeHeroSlides(deferredHdLayers: readonly string[]) {
  if (!deferredHdLayers.length) {
    return
  }

  const slides = document.querySelectorAll<HTMLElement>(
    "[data-home-hero-slide-deferred]",
  )

  const applyHd = (element: HTMLElement, hdBackground: string) => {
    warmHeroHdBackground(hdBackground)
    element.style.setProperty("--home-hero-image-hd", hdBackground)
    element.removeAttribute("data-home-hero-slide-deferred")
  }

  const schedule = () => {
    /** ms after `load` — slide 2 @ 25%, 3 @ 50%, 4 @ 75% of the 20s loop */
    const delaysMs = [0, 3_500, 7_500, 11_500]

    slides.forEach((element, index) => {
      const hd = deferredHdLayers[index]
      if (!hd) {
        return
      }
      const delay = delaysMs[index] ?? index * 3_500
      window.setTimeout(() => applyHd(element, hd), delay)
    })
  }

  if (document.readyState === "complete") {
    schedule()
  } else {
    window.addEventListener("load", schedule, { once: true })
  }
}