/** Run work after `load` in an idle callback (or soon after load when idle is unavailable). */
export function scheduleAfterLoadIdle(
  work: () => void,
  idleTimeoutMs: number,
): void {
  const scheduleIdle = () => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(work, { timeout: idleTimeoutMs })
    } else {
      setTimeout(work, 0)
    }
  }

  if (document.readyState === "complete") {
    scheduleIdle()
    return
  }
  window.addEventListener("load", scheduleIdle, { once: true })
}