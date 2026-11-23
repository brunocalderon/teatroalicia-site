import { getEntry } from "astro:content"

import type { InvitationContentCollection } from "@/lib/invitation-form-entries"
import type { FormEntryData } from "@/lib/form-schema"

export async function resolveInvitationFormData(
  collection: InvitationContentCollection,
  entryId: string,
  fallback: FormEntryData,
): Promise<FormEntryData> {
  if (collection === "airtable") {
    return fallback
  }

  const entry = await getEntry("forms", entryId)
  return entry?.data ?? fallback
}