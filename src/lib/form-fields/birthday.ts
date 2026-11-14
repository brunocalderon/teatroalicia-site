export function formatBirthdayIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatBirthdayDisplay(date: Date, lang: string): string {
  const locale = lang === "es" ? "es" : "en-US"
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function birthdayValidationMessage(lang: string): string {
  return lang === "es" ? "Selecciona tu fecha de nacimiento." : "Select your date of birth."
}