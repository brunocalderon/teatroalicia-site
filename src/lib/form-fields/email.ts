const EMAIL_INPUT =
  typeof document !== "undefined"
    ? (() => {
        const input = document.createElement("input")
        input.type = "email"
        return input
      })()
    : null

export function emailValidationMessage(lang: string): string {
  return lang === "es"
    ? "Ingresa un correo electrónico válido."
    : "Enter a valid email address."
}

export function isValidEmailAddress(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }
  if (EMAIL_INPUT) {
    EMAIL_INPUT.value = trimmed
    return EMAIL_INPUT.checkValidity()
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}