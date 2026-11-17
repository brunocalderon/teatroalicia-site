import type { CollectionEntry } from "astro:content"

import { eventToFormEntryData } from "@/lib/event-to-form"
import { eventHasInvitation } from "@/lib/event-schema"
import type { FormEntryData } from "@/lib/form-schema"

export type InvitationContentCollection = "forms" | "events"

export type InvitationFormEntry = {
  id: string
  collection: InvitationContentCollection
  data: FormEntryData
}

type FormCollectionEntry = CollectionEntry<"forms">
type EventCollectionEntry = CollectionEntry<"events">

/** Formgong routes from `content/forms` and event files with `invitation`. */
export function collectInvitationFormEntries(
  forms: FormCollectionEntry[],
  events: EventCollectionEntry[],
): InvitationFormEntry[] {
  const fromForms: InvitationFormEntry[] = forms.map((entry) => ({
    id: entry.id,
    collection: "forms",
    data: entry.data,
  }))

  const fromEvents: InvitationFormEntry[] = []
  for (const entry of events) {
    if (!eventHasInvitation(entry.data)) {
      continue
    }
    const data = eventToFormEntryData(entry.data)
    if (!data) {
      continue
    }
    fromEvents.push({
      id: entry.id,
      collection: "events",
      data,
    })
  }

  return [...fromForms, ...fromEvents]
}