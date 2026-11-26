import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri"
import { normalizeFormIntroHtml } from "@/lib/normalize-form-intro-html"

type MarkdownProcessor = Awaited<
  ReturnType<typeof createSatteriMarkdownProcessor>
>

let processorPromise: Promise<MarkdownProcessor> | undefined

async function getFormBodyMarkdownProcessor(): Promise<MarkdownProcessor> {
  processorPromise ??= createSatteriMarkdownProcessor({ gfm: true })
  return processorPromise
}

/** Render invitation copy markdown (`formBody`, `thankYouBody`, etc.) to HTML. */
export async function renderFormBodyMarkdown(markdown: string): Promise<string> {
  const processor = await getFormBodyMarkdownProcessor()
  const { code } = await processor.render(markdown.trim())
  return code
}

export type FormBodyFormat = "markdown" | "html"

/** Split-layout intro: markdown (content forms, default guest-list copy) or raw HTML (Airtable). */
export async function resolveFormIntroBodyHtml(
  body: string,
  format: FormBodyFormat = "markdown",
): Promise<string> {
  const trimmed = body.trim()
  if (!trimmed) {
    return ""
  }
  if (format === "html") {
    return normalizeFormIntroHtml(trimmed)
  }
  return renderFormBodyMarkdown(trimmed)
}