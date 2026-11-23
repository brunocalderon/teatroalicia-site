import { AIRTABLE_INVITATION_FORM_TOKEN } from "astro:env/server"

/** Formgong token for Airtable guest-list invitation forms. */
export function resolveAirtableInvitationFormToken(): string | undefined {
  const token = AIRTABLE_INVITATION_FORM_TOKEN.trim()
  return token || undefined
}