const CARTELERA_DETAILS_SELECTOR = ".home-nav__cartelera"

/** Close cartelera dropdown when clicking outside or pressing Escape. */
export function initHomeNavCarteleraDropdown(): void {
  const details = document.querySelector<HTMLDetailsElement>(
    CARTELERA_DETAILS_SELECTOR,
  )
  if (!details) {
    return
  }

  document.addEventListener("click", (event) => {
    if (!details.open) {
      return
    }
    const target = event.target
    if (!(target instanceof Node)) {
      return
    }
    if (!details.contains(target)) {
      details.open = false
    }
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && details.open) {
      details.open = false
    }
  })
}