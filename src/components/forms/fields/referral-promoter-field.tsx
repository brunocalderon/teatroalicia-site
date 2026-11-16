import { BadgeCheck } from "lucide-react"

import type { FormFieldControlProps } from "@/components/forms/fields/types"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { referralFieldLabel } from "@/lib/form-fields/referral"

type ReferralPromoterFieldProps = FormFieldControlProps & {
  promoter?: { id: string; name: string }
  referralPromoterPending?: boolean
}

export function ReferralPromoterField({
  field,
  promoter,
  lang,
  referralPromoterPending = false,
}: ReferralPromoterFieldProps) {
  const fieldId = `field-${field.name}`
  const titleId = `${fieldId}-title`
  const label = referralFieldLabel(lang, field.label)
  const loadingMessage =
    lang === "es" ? "Cargando invitado por…" : "Loading referral…"
  const showSkeleton = referralPromoterPending
  const displayName = promoter?.name ?? ""

  return (
    <div
      className="form-referral-display"
      aria-busy={showSkeleton ? true : undefined}
    >
      {showSkeleton ? <span className="sr-only">{loadingMessage}</span> : null}
      <Item
        variant="outline"
        size="sm"
        className="form-referral-item w-full min-w-0 cursor-default focus-visible:ring-0"
        role="group"
        aria-labelledby={titleId}
      >
        <ItemMedia variant="icon">
          {showSkeleton ? (
            <Skeleton className="size-4 shrink-0 rounded-full" aria-hidden />
          ) : (
            <BadgeCheck aria-hidden strokeWidth={2} />
          )}
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle id={titleId}>
            {label}:{" "}
            <span className="italic" suppressHydrationWarning>
              {displayName}
            </span>
          </ItemTitle>
        </ItemContent>
      </Item>
    </div>
  )
}