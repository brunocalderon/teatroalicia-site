import { BadgeCheck } from "lucide-react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { referralFieldLabel } from "@/lib/form-fields/referral"

type ReferralPromoterFieldProps = FormFieldControlProps & {
  promoter: { id: string; name: string }
}

export function ReferralPromoterField({
  field,
  promoter,
  lang,
}: ReferralPromoterFieldProps) {
  const fieldId = `field-${field.name}`
  const titleId = `${fieldId}-title`
  const label = referralFieldLabel(lang, field.label)

  return (
    <div className="form-referral-display">
      <Item
        variant="outline"
        size="sm"
        className="w-full min-w-0 cursor-default focus-visible:ring-0"
        role="group"
        aria-labelledby={titleId}
      >
        <ItemMedia variant="icon">
          <BadgeCheck aria-hidden strokeWidth={2} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle id={titleId}>
            {label}:{" "}
            <span className="italic">{promoter.name}</span>
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}