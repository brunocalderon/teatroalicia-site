import { useEffect, useMemo } from "react"

import {
  THANK_YOU_NAME_QUERY_PARAM,
  formatThankYouFirstName,
  prefixThankYouFirstParagraphHtml,
} from "@/lib/form-thank-you"
import { hasPendingMetaPixelUserData } from "@/lib/meta-pixel-pending-storage"
import {
  trackMetaCompleteRegistrationFromPendingStorage,
  type MarketingPageTracking,
} from "@/lib/marketing-page-tracking"

export type ThankYouBodyProps = {
  paragraphsHtml: string[]
  locale: string
  marketingTracking: MarketingPageTracking
}

export function ThankYouBody({
  paragraphsHtml,
  locale,
  marketingTracking,
}: ThankYouBodyProps) {
  useEffect(() => {
    if (!hasPendingMetaPixelUserData()) {
      return
    }
    const engage =
      typeof window !== "undefined"
        ? (
            window as Window & { engageMarketingPixels?: () => void }
          ).engageMarketingPixels
        : undefined
    engage?.()
    trackMetaCompleteRegistrationFromPendingStorage(marketingTracking)
  }, [marketingTracking])

  const displayedParagraphsHtml = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const firstName = formatThankYouFirstName(
      params.get(THANK_YOU_NAME_QUERY_PARAM) ?? ""
    )
    if (!firstName || paragraphsHtml.length === 0) {
      return paragraphsHtml
    }
    const thankYouLocale = locale === "es" ? "es" : "en"
    return [
      prefixThankYouFirstParagraphHtml(
        paragraphsHtml[0],
        firstName,
        thankYouLocale
      ),
      ...paragraphsHtml.slice(1),
    ]
  }, [locale, paragraphsHtml])

  return (
    <div className="form-page__thank-you-body">
      {displayedParagraphsHtml.map((html, index) => (
        <div
          key={index}
          dangerouslySetInnerHTML={{ __html: html }}
          suppressHydrationWarning
        />
      ))}
    </div>
  )
}