import {
  type ReferralAttribution,
  referralEnabledFieldName,
} from "@/lib/referral-attribution"

type ReferralAttributionFieldsProps = {
  referralFieldName: string
  attribution: ReferralAttribution
}

export function ReferralAttributionFields({
  referralFieldName,
  attribution,
}: ReferralAttributionFieldsProps) {
  return (
    <>
      <input
        type="hidden"
        name={referralFieldName}
        value={attribution.referralValue}
      />
      <input
        type="hidden"
        name={referralEnabledFieldName}
        value={attribution.verified ? "true" : "false"}
      />
    </>
  )
}