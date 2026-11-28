export const CARTELERA_POSTER_LIGHTBOX_MOBILE_MQ =
  "(max-width: 55.999rem)"

const LIGHTBOX_SELECTOR = "[data-cartelera-poster-lightbox]"
const IMAGE_SELECTOR = "[data-cartelera-poster-lightbox-image]"
const OPEN_TRIGGER_SELECTOR = "[data-cartelera-poster-zoom]"

function getLightbox(root: ParentNode): HTMLElement | null {
  return root.querySelector<HTMLElement>(LIGHTBOX_SELECTOR)
}

function isMobileViewport(): boolean {
  return window.matchMedia(CARTELERA_POSTER_LIGHTBOX_MOBILE_MQ).matches
}

function lockScroll(lock: boolean): void {
  document.documentElement.classList.toggle("home-poster-lightbox-open", lock)
}

export function openCarteleraPosterLightbox(
  root: ParentNode,
  options: { src: string; title: string },
): void {
  const lightbox = getLightbox(root)
  if (!lightbox) {
    return
  }

  const image = lightbox.querySelector<HTMLImageElement>(IMAGE_SELECTOR)
  const titleEl = lightbox.querySelector<HTMLElement>(
    "[data-cartelera-poster-lightbox-title]",
  )
  if (!image) {
    return
  }

  image.src = options.src
  image.alt = options.title
  if (titleEl) {
    titleEl.textContent = options.title
  }

  lightbox.hidden = false
  lockScroll(true)

  const closeButton = lightbox.querySelector<HTMLButtonElement>(
    "[data-cartelera-poster-lightbox-close]",
  )
  closeButton?.focus()
}

export function closeCarteleraPosterLightbox(root: ParentNode = document): void {
  const lightbox = getLightbox(root)
  if (!lightbox || lightbox.hidden) {
    return
  }

  const image = lightbox.querySelector<HTMLImageElement>(IMAGE_SELECTOR)
  lightbox.hidden = true
  lockScroll(false)
  if (image) {
    image.removeAttribute("src")
    image.alt = ""
  }
}

export type CarteleraPosterLightboxOptions = {
  /** Cartelera cards: mobile only; event detail enables desktop zoom. */
  mobileOnly?: boolean
}

export function initCarteleraPosterLightbox(
  root: ParentNode = document,
  options?: CarteleraPosterLightboxOptions,
): void {
  const mobileOnly = options?.mobileOnly ?? true
  const lightbox = getLightbox(root)
  if (!lightbox) {
    return
  }

  root.addEventListener("click", (event) => {
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }

    const trigger = target.closest<HTMLElement>(OPEN_TRIGGER_SELECTOR)
    if (trigger && (!mobileOnly || isMobileViewport())) {
      event.preventDefault()
      const src = trigger.dataset.zoomSrc?.trim()
      if (!src) {
        return
      }
      openCarteleraPosterLightbox(root, {
        src,
        title: trigger.dataset.eventTitle?.trim() ?? "",
      })
      return
    }

    const close = target.closest("[data-cartelera-poster-lightbox-close]")
    if (close) {
      event.preventDefault()
      closeCarteleraPosterLightbox(root)
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return
    }
    closeCarteleraPosterLightbox(root)
  })
}