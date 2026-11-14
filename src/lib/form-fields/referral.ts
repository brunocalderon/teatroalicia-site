export function referralFieldLabel(lang: string, configuredLabel: string): string {
  const label = configuredLabel.trim()
  if (label === "" || label === "Referido") {
    return lang === "es" ? "Invitado por" : "Invited by"
  }
  return label
}