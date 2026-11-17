import { getEntry } from "astro:content"

import { eventToFormEntryData } from "@/lib/event-to-form"
import type { InvitationContentCollection } from "@/lib/invitation-form-entries"
import type { FormEntryData } from "@/lib/form-schema"

export async function resolveInvitationFormData(
  collection: InvitationContentCollection,
  entryId: string,
  fallback: FormEntryData,
): Promise<FormEntryData> {
  if (collection === "forms") {
    const entry = await getEntry("forms", entryId)
    return entry?.data ?? fallback
  }

  const entry = await getEntry("events", entryId)
  if (!entry) {
    return fallback
  }

  return eventToFormEntryData(entry.data) ?? fallback
}