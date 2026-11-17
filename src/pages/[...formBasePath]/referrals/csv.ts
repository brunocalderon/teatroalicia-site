import { getCollection } from "astro:content"
import type { APIRoute } from "astro"

import { collectInvitationFormEntries } from "@/lib/invitation-form-entries"
import {
  buildFormReferralsCsv,
  formReferralsCsvFilename,
} from "@/lib/form-referrals-csv"
import { resolveSiteOrigin } from "@/lib/site-origin"

export const prerender = true

export async function getStaticPaths() {
  const forms = await getCollection("forms")
  const events = await getCollection("events")
  const invitationEntries = collectInvitationFormEntries(forms, events)

  return invitationEntries
    .filter((entry) =>
      entry.data.fields.some((field) => field.type === "referral"),
    )
    .map((entry) => ({
      params: {
        formBasePath: entry.data.path.replace(/^\//, ""),
      },
      props: {
        formPath: entry.data.path,
      },
    }))
}

export const GET: APIRoute = ({ props }) => {
  const formPath =
    props && typeof props === "object" && "formPath" in props
      ? String(props.formPath)
      : "/"

  const csv = buildFormReferralsCsv(formPath, resolveSiteOrigin())

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${formReferralsCsvFilename(formPath)}"`,
    },
  })
}