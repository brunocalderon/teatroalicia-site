import type { FormEventKind } from "@/lib/form-schema"

export function resolveEventSchemaTypes(
  eventKind: FormEventKind,
): string | string[] {
  switch (eventKind) {
    case "general":
      return "Event"
    case "social":
      return "SocialEvent"
    case "music":
      return "MusicEvent"
    case "social-music":
      return ["SocialEvent", "MusicEvent"]
    case "business":
      return "BusinessEvent"
    case "theater":
      return "TheaterEvent"
    default: {
      const unreachable: never = eventKind
      throw new Error(`Unhandled event kind: ${unreachable}`)
    }
  }
}