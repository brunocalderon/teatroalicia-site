import { BadgeCheck } from "lucide-react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"

type ReferralPromoterFieldProps = FormFieldControlProps & {
  promoter: { id: string; name: string }
}

export function ReferralPromoterField({
  field,
  promoter,
}: ReferralPromoterFieldProps) {
  const fieldId = `field-${field.name}`

  return (
    <div className="formgong-referral-display">
      <input
        id={fieldId}
        type="text"
        className="formgong-input formgong-input--referral-display"
        value={promoter.name}
        size={Math.max(promoter.name.length, 1)}
        disabled
        readOnly
        tabIndex={-1}
        aria-readonly="true"
      />
      <BadgeCheck
        className="formgong-referral-display__badge"
        aria-hidden="true"
        strokeWidth={2}
      />
    </div>
  )
}