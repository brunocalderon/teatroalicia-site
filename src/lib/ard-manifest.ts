import type { CollectionEntry } from "astro:content"

import { formMetaDescription } from "@/lib/form-schema"

type FormEntry = CollectionEntry<"forms">

export type ArdManifestEntry = {
  identifier: string
  displayName: string
  type: string
  url: string
  description: string
  representativeQueries: string[]
  tags?: string[]
  updatedAt: string
}

export type ArdManifest = {
  specVersion: string
  host: {
    displayName: string
    identifier: string
    documentationUrl: string
  }
  entries: ArdManifestEntry[]
}

function absoluteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${origin}${path}`
}

/** Domain segment for `urn:air:` identifiers (publisher-authority binding). */
export function ardPublisherAuthority(origin: string): string {
  const hostname = new URL(origin).hostname
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "teatroalicia.com"
  }
  return hostname
}

function urn(publisher: string, resource: string): string {
  return `urn:air:${publisher}:${resource}`
}

function buildEntry(
  publisher: string,
  resource: string,
  entry: Omit<ArdManifestEntry, "identifier" | "updatedAt">,
): ArdManifestEntry {
  return {
    ...entry,
    identifier: urn(publisher, resource),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * ARD manifest v0.91 for `/.well-known/ard.json`.
 * @see https://agenticresourcediscovery.org/spec
 */
export function buildArdManifest(
  origin: string,
  forms: FormEntry[],
): ArdManifest {
  const publisher = ardPublisherAuthority(origin)

  const entries: ArdManifestEntry[] = [
    buildEntry(publisher, "llms-txt", {
      displayName: "llms.txt",
      type: "text/plain",
      url: absoluteUrl(origin, "/llms.txt"),
      description:
        "Curated discovery index for the Teatro Alicia public site (home and crawler rules).",
      representativeQueries: [
        "What pages does the Teatro Alicia site publish?",
        "Where is the Teatro Alicia llms.txt?",
        "Summarize Teatro Alicia public routes for agents.",
      ],
      tags: ["llms.txt", "discovery", "documentation"],
    }),
    buildEntry(publisher, "robots-txt", {
      displayName: "robots.txt",
      type: "text/plain",
      url: absoluteUrl(origin, "/robots.txt"),
      description: "Crawler rules for the Teatro Alicia site.",
      representativeQueries: [
        "Which paths are disallowed for crawlers?",
        "What is the robots.txt policy for this site?",
      ],
      tags: ["robots", "crawling"],
    }),
    buildEntry(publisher, "home", {
      displayName: "Teatro Alicia — home",
      type: "text/html",
      url: absoluteUrl(origin, "/"),
      description: "Public landing page for Teatro Alicia.",
      representativeQueries: [
        "What is on the Teatro Alicia home page?",
        "Is the Teatro Alicia site live?",
      ],
      tags: ["marketing", "landing"],
    }),
  ]

  const sortedForms = [...forms].sort((a, b) =>
    a.data.path.localeCompare(b.data.path),
  )

  for (const form of sortedForms) {
    const slug = form.id.replace(/[^a-zA-Z0-9._-]/g, "-")
    const metaDescription = formMetaDescription(form.data)
    entries.push(
      buildEntry(publisher, `form:${slug}`, {
        displayName: form.data.title,
        type: "text/html",
        url: absoluteUrl(origin, form.data.path),
        description: metaDescription,
        representativeQueries: [
          `How do I request courtesy tickets for ${form.data.title}?`,
          `Where is the ${form.data.title} invitation form?`,
          "¿Cómo solicito tickets de cortesía para este evento?",
        ],
        tags: ["form", "invitation", form.data.lang],
      }),
    )
  }

  return {
    specVersion: "0.91",
    host: {
      displayName: "Teatro Alicia",
      identifier: urn(publisher, "site"),
      documentationUrl: "https://github.com/brunocalderon/teatroalicia-site",
    },
    entries,
  }
}