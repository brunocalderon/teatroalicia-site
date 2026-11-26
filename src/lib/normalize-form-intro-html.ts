const NBSP = /\u00a0|&nbsp;/gi

/**
 * Airtable HTML often inserts NBSP + newlines before each `<li>`, which become
 * orphan text nodes inside `<ul>` and render as blank lines between items.
 */
export function normalizeFormIntroHtml(html: string): string {
  let out = html.replace(NBSP, " ")

  out = out.replace(/<\/li>\s+(?=<li\b)/gi, "</li>")
  out = out.replace(/<ul([^>]*)>\s+(?=<li\b)/gi, "<ul$1>")
  out = out.replace(/>\s+</g, "><")

  return out
}