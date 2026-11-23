import type { FormField } from "@/lib/form-schema"

export const defaultGuestPassReferralField: FormField = {
  name: "referral_id",
  label: "Invitado por",
  type: "referral",
  required: false,
}

/** Guest-pass routes need a referral field for `?e=` attribution and hidden POST fields. */
export function ensureGuestPassReferralField(fields: FormField[]): FormField[] {
  if (fields.some((field) => field.type === "referral")) {
    return fields
  }
  return [...fields, defaultGuestPassReferralField]
}

export function isGuestPassInvitationPath(path: string): boolean {
  return path.startsWith("/i/")
}