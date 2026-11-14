import promotersRoster, {
  type PromoterRosterEntry,
} from "@/config/promoters.roster"
import { promoterRefQueryParam } from "@/lib/promoters"

const PROMOTER_COLUMNS = [
  "id",
  "name",
  "email",
  "active",
  "ticket_sale_enabled",
  "guest_pass_enabled",
] as const satisfies readonly (keyof PromoterRosterEntry)[]

const FORM_LINK_COLUMN = "form_link"

export const formReferralsCsvColumns = [
  ...PROMOTER_COLUMNS,
  FORM_LINK_COLUMN,
] as const

function escapeCsvCell(value: string | boolean): string {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

function buildGuestPassFormLink(formPath: string, promoterId: string, origin: string): string {
  const base = origin.replace(/\/$/, "")
  const path = formPath.startsWith("/") ? formPath : `/${formPath}`
  const url = new URL(path, `${base}/`)
  url.searchParams.set(promoterRefQueryParam, promoterId)
  return url.href
}

export function eligibleGuestPassPromoters(): PromoterRosterEntry[] {
  return promotersRoster.filter(
    (promoter) => promoter.active && promoter.guest_pass_enabled
  )
}

export function buildFormReferralsCsv(formPath: string, origin: string): string {
  const promoters = eligibleGuestPassPromoters()

  const header = formReferralsCsvColumns.map(escapeCsvCell).join(",")
  const rows = promoters.map((promoter) => {
    const cells: (string | boolean)[] = PROMOTER_COLUMNS.map(
      (column) => promoter[column]
    )
    cells.push(buildGuestPassFormLink(formPath, promoter.id, origin))
    return cells.map(escapeCsvCell).join(",")
  })

  return `${[header, ...rows].join("\n")}\n`
}

export function formReferralsCsvFilename(formPath: string): string {
  const slug = formPath.replace(/^\//, "").replaceAll("/", "-") || "form"
  return `${slug}-referrals.csv`
}