import { useEffect, useMemo } from "react"

import {
  THANK_YOU_NAME_QUERY_PARAM,
  formatThankYouFirstName,
  prefixThankYouFirstParagraph,
} from "@/lib/formgong-thank-you"
import {
  trackMetaCompleteRegistrationFromPendingStorage,
  type MarketingPageTracking,
} from "@/lib/marketing-page-tracking"

export type ThankYouBodyProps = {
  paragraphs: string[]
  locale: string
  marketingTracking: MarketingPageTracking
}

export function ThankYouBody({
  paragraphs,
  locale,
  marketingTracking,
}: ThankYouBodyProps) {
  useEffect(() => {
    trackMetaCompleteRegistrationFromPendingStorage(marketingTracking)
  }, [marketingTracking])
  const displayedParagraphs = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const firstName = formatThankYouFirstName(
      params.get(THANK_YOU_NAME_QUERY_PARAM) ?? ""
    )
    if (!firstName || paragraphs.length === 0) {
      return paragraphs
    }
    const thankYouLocale = locale === "es" ? "es" : "en"
    return [
      prefixThankYouFirstParagraph(paragraphs[0], firstName, thankYouLocale),
      ...paragraphs.slice(1),
    ]
  }, [locale, paragraphs])

  return (
    <div className="form-page__thank-you-body">
      {displayedParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}