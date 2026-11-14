import type { CollectionEntry } from "astro:content"

type FormEntry = CollectionEntry<"forms">

function absoluteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${origin}${path}`
}

/**
 * Root llms.txt body (llmstxt.org v2). Served at `/llms.txt` with `text/plain; charset=utf-8`.
 */
export function buildLlmsTxt(origin: string, forms: FormEntry[]): string {
  const lines: string[] = [
    "# Teatro Alicia",
    "",
    "> Sitio del Teatro Alicia (Santiago, Chile): página de inicio y formularios públicos de solicitud de invitaciones y tickets de cortesía a eventos.",
    "",
    "Las rutas públicas se generan en el build a partir de `content/forms/*.md`. Los envíos usan Formgong y Cloudflare Turnstile en las páginas de formulario. No publiques tokens ni claves de API.",
    "",
    "## Pages",
    "",
    `- [Inicio](${absoluteUrl(origin, "/")}): Página principal del sitio.`,
  ]

  const sortedForms = [...forms].sort((a, b) =>
    a.data.path.localeCompare(b.data.path),
  )

  for (const form of sortedForms) {
    const { title, path, thankYouPath, lang } = form.data
    const langNote = lang === "es" ? "español" : lang
    lines.push(
      `- [${title}](${absoluteUrl(origin, path)}): Formulario de invitación (${langNote}).`,
      `- [${title} — confirmación](${absoluteUrl(origin, thankYouPath)}): Página de gracias tras enviar la solicitud.`,
    )
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [robots.txt](${absoluteUrl(origin, "/robots.txt")}): Reglas para rastreadores.`,
    "- [Repositorio en GitHub](https://github.com/brunocalderon/teatroalicia-site): Código fuente y documentación para desarrolladores.",
    "",
  )

  return lines.join("\n")
}