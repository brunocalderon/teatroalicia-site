import type { CollectionEntry } from "astro:content"

import { resolveGuestListRouteKind } from "@/lib/airtable-cartelera/guest-list-route"
import { loadAirtableCarteleraRows } from "@/lib/airtable-cartelera/load-cartelera-rows"
import { airtableRowToInvitationFormData } from "@/lib/airtable-cartelera/to-invitation-form"
import { resolveAirtableCarteleraConfig } from "@/lib/airtable-env"
import { resolveAirtableInvitationFormToken } from "@/lib/airtable-invitation-env"
import type { FormEntryData } from "@/lib/form-schema"
import {
  ensureGuestPassReferralField,
  isGuestPassInvitationPath,
} from "@/lib/guest-pass-referral-field"

export type InvitationContentCollection = "forms" | "airtable"

export type InvitationFormEntry = {
  id: string
  collection: InvitationContentCollection
  data: FormEntryData
}

type FormCollectionEntry = CollectionEntry<"forms">

function withGuestPassReferralFields(data: FormEntryData): FormEntryData {
  if (!isGuestPassInvitationPath(data.path)) {
    return data
  }
  return {
    ...data,
    fields: ensureGuestPassReferralField(data.fields),
  }
}

function invitationEntriesFromForms(
  forms: FormCollectionEntry[],
): InvitationFormEntry[] {
  return forms.map((entry) => ({
    id: entry.id,
    collection: "forms",
    data: withGuestPassReferralFields(entry.data),
  }))
}

async function invitationEntriesFromAirtable(): Promise<InvitationFormEntry[]> {
  const carteleraConfig = resolveAirtableCarteleraConfig()
  const formToken = resolveAirtableInvitationFormToken()
  if (!carteleraConfig || !formToken) {
    return []
  }

  const rows = await loadAirtableCarteleraRows(carteleraConfig)
  return rows
    .filter((row) => resolveGuestListRouteKind(row) !== "none")
    .map((row) => ({
      id: row.slug,
      collection: "airtable",
      data: withGuestPassReferralFields(
        airtableRowToInvitationFormData(row, { formToken }),
      ),
    }))
}

/** Formgong routes from `content/forms` and Airtable Events (guest list). */
export async function loadInvitationFormEntries(
  forms: FormCollectionEntry[],
): Promise<InvitationFormEntry[]> {
  const fromForms = invitationEntriesFromForms(forms)
  const fromAirtable = resolveAirtableCarteleraConfig()
    ? await invitationEntriesFromAirtable()
    : []

  return [...fromForms, ...fromAirtable]
}