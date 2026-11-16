export const formCopy = {
  turnstile: {
    label: "Security check",
    siteKeyMissing:
      "Add CLOUDFLARE_TURNSTILE_SITE_KEY to your environment (Cloudflare Turnstile site key). Formgong forms require Turnstile in production.",
    devPlaceholder:
      "Set CLOUDFLARE_TURNSTILE_SITE_KEY in `.env` to show Turnstile here (Cloudflare dummy site keys work in dev).",
  },
  errors: {
    formNotConfigured:
      "This form is not configured yet. Add the Formgong access key to your environment.",
    turnstileRequired:
      "Complete the security check before submitting.",
    connectionFailed: "Could not send your request. Please try again.",
  },
} as const
