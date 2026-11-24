// @ts-nocheck — emitted as classic inline script (no module graph).
;(function () {
  var CONFIG_EL = document.getElementById("marketing-head-config")
  if (!CONFIG_EL) return
  var config
  try {
    config = JSON.parse(CONFIG_EL.textContent || "{}")
  } catch (e) {
    return
  }
  var engaged = false

  function parseUmamiEventData(json) {
    if (!json) return null
    try {
      var parsed = JSON.parse(json)
      return parsed && typeof parsed === "object" ? parsed : null
    } catch (e) {
      return null
    }
  }

  function mergeUmamiTrackData(baseData, promoterData) {
    if (baseData && promoterData) {
      return Object.assign({}, baseData, promoterData)
    }
    return baseData || promoterData || null
  }

  function defineUmamiPageView(eventName, umamiEventDataJson) {
    if (!eventName) return
    var baseData = parseUmamiEventData(umamiEventDataJson)
    window.customPageViewTracking = function () {
      if (typeof window.umami !== "undefined" && window.umami.track) {
        var promoterData =
          typeof window.__umamiPromoterEventData === "function"
            ? window.__umamiPromoterEventData()
            : null
        var payload = mergeUmamiTrackData(baseData, promoterData)
        if (payload) {
          window.umami.track(eventName, payload)
        } else {
          window.umami.track(eventName)
        }
      }
    }
  }

  function ensureFacebookPixelBootstrap(pixelId) {
    if (!pixelId) return false
    if (window.fbq) return true
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = "2.0"
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js")
    return true
  }

  function loadFacebookPixel(pixelId, trackContent, metaEvent, metaPayloadJson) {
    if (!ensureFacebookPixelBootstrap(pixelId)) return
    window.fbq("init", pixelId)
    window.fbq("track", "PageView")
    if (trackContent && metaPayloadJson) {
      try {
        var metaPayload = JSON.parse(metaPayloadJson)
        window.fbq("track", metaEvent, metaPayload)
      } catch (err) {
        window.fbq("track", metaEvent)
      }
    }
  }

  function loadUmami(websiteId) {
    if (!websiteId || document.querySelector('script[data-marketing-umami="true"]')) {
      return
    }
    defineUmamiPageView(config.umamiEventName, config.umamiEventData)
    var script = document.createElement("script")
    script.async = true
    script.defer = true
    script.dataset.websiteId = websiteId
    script.dataset.marketingUmami = "true"
    script.src = "https://cloud.umami.is/script.js"
    script.onload = function () {
      if (typeof window.customPageViewTracking === "function") {
        window.customPageViewTracking()
      }
    }
    document.head.appendChild(script)
  }

  function runMarketingLoads() {
    if (config.facebookPixelId) {
      loadFacebookPixel(
        config.facebookPixelId,
        config.trackContent,
        config.metaEvent,
        config.metaPayload === "null" ? "" : config.metaPayload,
      )
    }
    if (config.umamiWebsiteId) {
      loadUmami(config.umamiWebsiteId)
    }
  }

  function engageMarketing() {
    if (engaged) return
    engaged = true
    if (config.engageAfterLoadMs > 0) {
      runMarketingLoads()
      return
    }
    var idleTimeout =
      typeof config.interactionIdleTimeoutMs === "number"
        ? config.interactionIdleTimeoutMs
        : 2000
    if ("requestIdleCallback" in window) {
      requestIdleCallback(runMarketingLoads, { timeout: idleTimeout })
    } else {
      setTimeout(runMarketingLoads, 0)
    }
  }

  var signals = ["pointerdown", "keydown", "touchstart", "scroll"]
  function armOnInteraction() {
    for (var i = 0; i < signals.length; i++) {
      window.addEventListener(signals[i], engageMarketing, {
        once: true,
        passive: true,
      })
    }
  }

  function armAfterFullLoad(delayMs) {
    function schedule() {
      setTimeout(engageMarketing, delayMs)
    }
    if (document.readyState === "complete") {
      schedule()
    } else {
      window.addEventListener("load", schedule, { once: true })
    }
  }

  window.engageMarketingPixels = engageMarketing

  if (config.engageAfterLoadMs > 0) {
    armAfterFullLoad(config.engageAfterLoadMs)
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", armOnInteraction)
  } else {
    armOnInteraction()
  }
})()