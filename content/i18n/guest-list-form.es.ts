import formIntroSource from "./guest-list-form-intro.es.md?raw"
import thankYouSource from "./guest-list-form-thank-you.es.md?raw"

const formIntroMarkdown = formIntroSource.trim()
const thankYouMarkdown = thankYouSource.trim()

/** Shared copy for Spanish guest-list invitation forms (`/i/:slug`). */
export const guestListFormEs = {
  lang: "es",
  submitLabel: "Solicitar mi acceso",
  /** Split-layout intro (`content/i18n/guest-list-form-intro.es.md`). */
  formIntroMarkdown,
  /** Thank-you body (`content/i18n/guest-list-form-thank-you.es.md`). */
  thankYouMarkdown,
  messages: {
    submit: "Enviar",
    sending: "Enviando…",
    turnstileRequired:
      "Completa la verificación de seguridad antes de enviar.",
    connectionFailed: "No pudimos enviar tu solicitud. Intenta de nuevo.",
    formBody: formIntroMarkdown,
    thankYouBody: thankYouMarkdown,
  },
  /** Shown when Airtable `Guest List` is off but `/i/:slug` remains published. */
  closed: {
    message:
      "El formulario de pase invitado está cerrado. Por ahora no recibimos nuevas solicitudes.",
    purchaseCta: "Comprar entradas",
  },
} as const