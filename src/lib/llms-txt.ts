function absoluteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${origin}${path}`
}

/**
 * Root llms.txt body (llmstxt.org v2). Served at `/llms.txt` with `text/plain; charset=utf-8`.
 */
export function buildLlmsTxt(origin: string): string {
  const lines: string[] = [
    "# Teatro Alicia",
    "",
    "> Sitio del Teatro Alicia (Santiago, Chile): página de inicio con cartelera de eventos.",
    "",
    "## Pages",
    "",
    `- [Inicio](${absoluteUrl(origin, "/")}): Página principal del sitio.`,
    "",
    "## Optional",
    "",
    `- [robots.txt](${absoluteUrl(origin, "/robots.txt")}): Reglas para rastreadores.`,
    "",
  ]

  return lines.join("\n")
}