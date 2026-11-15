import type { FormField } from "@/lib/form-schema"

/** Default name fields for thank-you redirect and Meta advanced matching. */
export function defaultNameFields(fields: readonly FormField[]): string[] {
  const names = new Set(fields.map((field) => field.name))
  const result: string[] = []
  if (names.has("firstName")) {
    result.push("firstName")
  }
  if (names.has("lastName")) {
    result.push("lastName")
  }
  return result
}