import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

type ReferralPromoterFieldSkeletonProps = {
  lang: string
}

export function ReferralPromoterFieldSkeleton({
  lang,
}: ReferralPromoterFieldSkeletonProps) {
  const loadingMessage =
    lang === "es" ? "Cargando invitado por…" : "Loading referral…"

  return (
    <div className="formgong-referral-display" aria-busy="true">
      <span className="sr-only">{loadingMessage}</span>
      <Item variant="outline" size="sm" className="w-full min-w-0">
        <ItemMedia variant="icon">
          <Skeleton className="size-4 rounded-full" />
        </ItemMedia>
        <ItemContent>
          <Skeleton className="h-4 w-48 max-w-full" />
        </ItemContent>
      </Item>
    </div>
  )
}