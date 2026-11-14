import type { FormField } from "@/lib/form-schema"

/** Autocomplete tokens for invitation forms (not account login). */
export function textLikeAutoComplete(field: FormField): string | undefined {
  if (field.type === "email") {
    return "email"
  }

  switch (field.name) {
    case "firstName":
      return "given-name"
    case "lastName":
      return "family-name"
    case "id":
      return "off"
    default:
      return undefined
  }
}

export const instagramFieldAutoComplete = "off"