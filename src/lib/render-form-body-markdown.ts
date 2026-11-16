import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri"

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