import { carteleraPosterImageBySlug } from "@/lib/airtable-cartelera/cartelera-poster-image-modules"
import {
  hasBundledFormEventImage,
  resolveFormEventImageSource,
} from "@/lib/form-event-image"
import {
  invitationSlugFromPath,
  resolveSlugBundledPosterPath,
} from "@/lib/invitation-bundled-poster"
import { buildFormSplitVisualImage } from "@/lib/form-split-visual-image"
import type { FormEntryData } from "@/lib/form-schema"

export { invitationSlugFromPath } from "@/lib/invitation-bundled-poster"

export async function resolveInvitationFormLcpImage(
  data: FormEntryData,
  slug?: string,
) {
  const resolvedSlug = slug ?? invitationSlugFromPath(data.path)

  if (data.image?.trim() && hasBundledFormEventImage(data.image)) {
    return buildFormSplitVisualImage(
      resolveFormEventImageSource(data.image),
    )
  }

  if (!resolvedSlug) {
    return undefined
  }

  const cachedPoster = await carteleraPosterImageBySlug(resolvedSlug)
  if (cachedPoster) {
    return buildFormSplitVisualImage(cachedPoster)
  }

  const bundledBySlug = resolveSlugBundledPosterPath(resolvedSlug)
  if (bundledBySlug) {
    return buildFormSplitVisualImage(
      resolveFormEventImageSource(bundledBySlug),
    )
  }

  return undefined
}