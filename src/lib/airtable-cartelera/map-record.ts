import type { AirtableCarteleraFields } from "@/lib/airtable-cartelera/airtable-response-schema"
import { parseAirtableEventDateTime } from "@/lib/airtable-cartelera/parse-datetime"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import {
  type AirtableFieldSet,
  readAirtableBoolean,
  readAirtableField,
} from "@/lib/airtable-cartelera/read-field"
import {
  resolveAirtableBrowseImage,
  resolveAirtableImageUrl,
} from "@/lib/parse-airtable-attachment-field"

export type MapAirtableCarteleraResult =
  | { ok: true; data: AirtableCarteleraRow }
  | { ok: false; recordId: string; message: string }

function asFieldSet(
  fields: AirtableCarteleraFields | AirtableFieldSet,
): AirtableFieldSet {
  return fields as AirtableFieldSet
}

export function mapAirtableCarteleraRecord(
  airtableRecordId: string,
  fieldsInput: AirtableCarteleraFields | AirtableFieldSet,
  createdTime?: string,
): MapAirtableCarteleraResult {
  const fields = asFieldSet(fieldsInput)

  const published = readAirtableBoolean(fields, [
    "Publish",
    "Published",
    "publish",
    "Cartelera",
    "Show on site",
  ])
  if (published === false) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: "not published on cartelera",
    }
  }

  const slug = readAirtableField(fields, ["Slug", "slug"])
  if (!slug) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: "missing Slug",
    }
  }

  const eventName = readAirtableField(fields, ["Event Name", "Name"])
  const titleColumn = readAirtableField(fields, ["Title", "title"])
  const title = eventName ?? titleColumn
  if (!title) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `missing Event Name (slug: ${slug})`,
    }
  }

  const eventId =
    readAirtableField(fields, ["eventId", "Event ID", "Event Id"]) ??
    (eventName && titleColumn ? titleColumn : undefined)
  if (!eventId) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `missing Title/eventId (slug: ${slug})`,
    }
  }

  const eventStartRaw = readAirtableField(fields, [
    "Start",
    "eventStart",
    "Event Start",
  ])
  if (!eventStartRaw) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `missing Start (slug: ${slug})`,
    }
  }

  const eventStart = parseAirtableEventDateTime(eventStartRaw)
  if (!eventStart) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: `invalid Start (slug: ${slug})`,
    }
  }

  const eventEndRaw = readAirtableField(fields, ["End", "eventEnd", "Event End"])
  const eventEnd = eventEndRaw
    ? parseAirtableEventDateTime(eventEndRaw)
    : undefined

  const ticketUrl = readAirtableField(fields, [
    "Purchase Link",
    "ticketLink",
    "ticketUrl",
    "Ticket Link",
    "Ticket URL",
  ])
  const invitationPath = readAirtableField(fields, [
    "invitationPath",
    "Invitation Path",
  ])
  const imageAlt =
    readAirtableField(fields, ["imageAlt", "Image Alt"]) ?? eventName
  const imageField = Object.entries(fields).find(
    ([key]) => key.toLowerCase() === "image",
  )?.[1]
  const attachment = resolveAirtableBrowseImage(fields)
  const imageUrl =
    attachment?.url ??
    (imageField !== undefined ? resolveAirtableImageUrl(imageField) : undefined)
  const imageFilename = attachment?.filename
  const eventKind = readAirtableField(fields, ["Event Kind", "eventKind"])
  const language = readAirtableField(fields, ["Language", "language"])

  return {
    ok: true,
    data: {
      slug,
      title,
      eventId,
      eventStart,
      eventEnd,
      ticketUrl,
      invitationPath,
      imageUrl,
      imageFilename,
      imageAlt,
      eventKind,
      language,
      airtableRecordId,
      createdTime,
    },
  }
}