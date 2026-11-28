import { resolveFormIntroBodyHtml } from "@/lib/render-form-body-markdown"
import { buildFormSplitVisualImage } from "@/lib/form-split-visual-image"
import type { InvitationContentCollection } from "@/lib/invitation-form-entries"
import { resolveInvitationFormLcpImage } from "@/lib/resolve-invitation-form-poster"
import { resolveInvitationFormData } from "@/lib/resolve-invitation-form-entry"
import {
  defaultNameFields,
  formMetaDescription,
  type FormEntryData,
} from "@/lib/form-schema"
import { CANONICAL_SITE_ORIGIN } from "@/lib/schema-org/canonical-origin"
import { buildInvitationPageJsonLd } from "@/lib/schema-org/build-invitation-page-json-ld"
import { resolveVenuePrimaryImageAbsoluteUrl } from "@/lib/venue-primary-image"
import { venueConfig } from "../../../content/venue"
import { sitePageBackdropCss } from "@/lib/site-page-backdrop-css"
import { invitationFormTracking } from "@/lib/marketing-page-tracking"
import type { MarketingPageTracking } from "@/lib/marketing-page-tracking"

export type GuestListInvitationPageContext = {
  data: FormEntryData
  nameFields: string[]
  hasReferralField: boolean
  formBodyHtml: string | undefined
  showFormIntro: boolean
  formLcpImage: Awaited<ReturnType<typeof buildFormSplitVisualImage>> | undefined
  showSplitLayout: boolean
  tracking: MarketingPageTracking
  formDescription: string
  formJsonLd: ReturnType<typeof buildInvitationPageJsonLd>
  formPageBackdropCss: string
  pageLcpImage:
    | {
        src: string
        srcSet: string
        sizes: string
      }
    | undefined
}

type PrepareGuestListInvitationPageOptions = {
  collection: InvitationContentCollection
  entryId: string
  dataFromProps: FormEntryData
  invitationSlug: string
}

/** Shared build-time props for `/i/:slug` invite and redirect experiences. */
export async function prepareGuestListInvitationPage(
  options: PrepareGuestListInvitationPageOptions,
): Promise<GuestListInvitationPageContext> {
  const { collection, entryId, dataFromProps, invitationSlug } = options

  const data = await resolveInvitationFormData(collection, entryId, dataFromProps)
  const hasReferralField = data.fields.some((field) => field.type === "referral")

  const formBodyMarkdown = data.messages?.formBody?.trim()
  const formBodyHtml = formBodyMarkdown
    ? await resolveFormIntroBodyHtml(
        formBodyMarkdown,
        data.messages?.formBodyFormat ?? "markdown",
      )
    : undefined

  const showFormIntro = Boolean(formBodyHtml)
  const nameFields = data.nameFields ?? defaultNameFields(data.fields)

  const formLcpImage = await resolveInvitationFormLcpImage(data, invitationSlug)
  const showSplitLayout = Boolean(formLcpImage)

  const tracking = invitationFormTracking(data.title, data.eventId)
  const formDescription = formMetaDescription(data)

  const eventImageUrl = formLcpImage
    ? new URL(formLcpImage.src, CANONICAL_SITE_ORIGIN).href
    : undefined
  const venueImageUrl = await resolveVenuePrimaryImageAbsoluteUrl()
  const formJsonLd = buildInvitationPageJsonLd({
    venue: venueConfig,
    data,
    pageTitle: data.title,
    pageDescription: formDescription,
    imageUrl: eventImageUrl,
    venueImageUrl,
  })

  const formPageBackdropCssValue = sitePageBackdropCss("form-page", {
    omitFixedBackdrop: false,
  })

  const pageLcpImage = formLcpImage
    ? {
        src: formLcpImage.src,
        srcSet: formLcpImage.srcSet,
        sizes: formLcpImage.sizes,
      }
    : undefined

  return {
    data,
    nameFields,
    hasReferralField,
    formBodyHtml,
    showFormIntro,
    formLcpImage,
    showSplitLayout,
    tracking,
    formDescription,
    formJsonLd,
    formPageBackdropCss: formPageBackdropCssValue,
    pageLcpImage,
  }
}