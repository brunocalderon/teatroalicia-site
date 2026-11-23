import { CheckIcon, CopyIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GuestPassPromoterLinkRow } from "@/lib/guest-pass-promoter-link"
import "@/styles/global.css"

type PromoterGuestPassLinksProps = {
  lang: string
  eventTitle: string
  heading: string
  promoters: GuestPassPromoterLinkRow[]
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase("es")
}

/** Visible link text on narrow layouts (href/title/copy stay absolute). */
function displayPromoterUrlCompact(url: string): string {
  return url.replace(/^https?:\/\//i, "")
}

function promoterMatchesQuery(
  promoter: GuestPassPromoterLinkRow,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true
  }
  const name = promoter.name.toLocaleLowerCase("es")
  const id = promoter.id.toLocaleLowerCase("es")
  return name.includes(normalizedQuery) || id.includes(normalizedQuery)
}

const COPY_FEEDBACK_MS = 2000

function PromoterCopyButton({
  promoter,
  copied,
  copyLabel,
  copiedLabel,
  onCopy,
  className,
}: {
  promoter: GuestPassPromoterLinkRow
  copied: boolean
  copyLabel: string
  copiedLabel: string
  onCopy: (promoter: GuestPassPromoterLinkRow) => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => void onCopy(promoter)}
      aria-label={`${copied ? copiedLabel : copyLabel}: ${promoter.name}`}
    >
      {copied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <CopyIcon data-icon="inline-start" />
      )}
      {copied ? copiedLabel : copyLabel}
    </Button>
  )
}

export function PromoterGuestPassLinks({
  lang,
  eventTitle,
  heading,
  promoters,
}: PromoterGuestPassLinksProps) {
  const [query, setQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredPromoters = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(query)
    return promoters.filter((promoter) =>
      promoterMatchesQuery(promoter, normalizedQuery),
    )
  }, [promoters, query])

  const searchLabel =
    lang === "es" ? "Buscar RRPP" : "Search promoters"
  const nameColumn = "RRPP"
  const linkColumn = "Link"
  const actionColumn = lang === "es" ? "Copiar" : "Copy"
  const emptyLabel =
    lang === "es"
      ? "No hay promotores que coincidan con tu búsqueda."
      : "No promoters match your search."
  const copyLabel = lang === "es" ? "Copiar link" : "Copy link"
  const copiedLabel = lang === "es" ? "Copiado" : "Copied"
  const countLabel =
    lang === "es"
      ? `${filteredPromoters.length} de ${promoters.length} promotores`
      : `${filteredPromoters.length} of ${promoters.length} promoters`

  async function copyLink(promoter: GuestPassPromoterLinkRow) {
    try {
      await navigator.clipboard.writeText(promoter.url)
      setCopiedId(promoter.id)
      window.setTimeout(() => {
        setCopiedId((current) => (current === promoter.id ? null : current))
      }, COPY_FEEDBACK_MS)
    } catch {
      window.prompt(copyLabel, promoter.url)
    }
  }

  return (
    <Card className="w-full gap-0 py-0 ring-foreground/10 [--card-spacing:--spacing(4)]">
      <CardHeader className="!flex flex-col gap-5 border-b border-border pb-4">
        <div className="mt-4 flex flex-col items-start gap-4 min-[56rem]:flex-row min-[56rem]:items-center min-[56rem]:gap-6">
          <a
            href="/"
            className="flex shrink-0 items-start"
            aria-label="Teatro Alicia"
          >
            <img
              src="/logo.svg"
              alt=""
              width={147}
              height={113}
              decoding="async"
              className="block h-[4.25rem] w-auto max-[55.99rem]:h-[3.2rem]"
            />
          </a>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm text-muted-foreground">{eventTitle}</p>
            <CardTitle className="text-xl font-medium tracking-wide">
              {heading}
            </CardTitle>
          </div>
        </div>
        <FieldGroup>
          <Field>
            <InputGroup className="h-10">
              <InputGroupAddon align="inline-start">
                <SearchIcon aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="promoter-link-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder={searchLabel}
                aria-label={searchLabel}
                className="text-base md:text-base"
              />
            </InputGroup>
          </Field>
        </FieldGroup>
      </CardHeader>
      <CardContent className="p-0">
        {filteredPromoters.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <>
            <ul className="divide-y divide-border min-[56rem]:hidden">
              {filteredPromoters.map((promoter) => {
                const copied = copiedId === promoter.id
                return (
                  <li
                    key={promoter.id}
                    className="flex flex-col gap-3 px-4 py-4"
                  >
                    <p className="text-sm leading-relaxed">
                      <span className="text-muted-foreground">
                        {nameColumn}:{" "}
                      </span>
                      <span className="font-medium text-foreground">
                        {promoter.name}
                      </span>
                    </p>
                    <p className="flex min-w-0 items-baseline gap-1 text-sm leading-relaxed">
                      <span className="shrink-0 text-muted-foreground">
                        {linkColumn}:
                      </span>
                      <a
                        href={promoter.url}
                        title={promoter.url}
                        className="min-w-0 truncate font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {displayPromoterUrlCompact(promoter.url)}
                      </a>
                    </p>
                    <PromoterCopyButton
                      promoter={promoter}
                      copied={copied}
                      copyLabel={copyLabel}
                      copiedLabel={copiedLabel}
                      onCopy={copyLink}
                      className="w-full"
                    />
                  </li>
                )
              })}
            </ul>
            <div className="hidden min-[56rem]:block [&_[data-slot=table-container]]:overflow-x-visible">
            <Table className="table-fixed">
              <colgroup>
                <col style={{ width: "28%" }} />
                <col />
                <col style={{ width: "8.75rem" }} />
              </colgroup>
              <TableHeader className="bg-muted/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 whitespace-nowrap bg-muted/95 px-4">
                    {nameColumn}
                  </TableHead>
                  <TableHead className="h-11 bg-muted/95 px-4">
                    {linkColumn}
                  </TableHead>
                  <TableHead className="h-11 bg-muted/95 px-4 text-center">
                    {actionColumn}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {filteredPromoters.map((promoter) => {
                  const copied = copiedId === promoter.id
                  return (
                    <TableRow key={promoter.id}>
                      <TableCell className="px-4 py-3 font-medium whitespace-nowrap">
                        <span className="block truncate" title={promoter.name}>
                          {promoter.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0 px-4 py-3">
                        <a
                          href={promoter.url}
                          title={promoter.url}
                          className="block truncate font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {promoter.url}
                        </a>
                      </TableCell>
                      <TableCell className="w-[8.75rem] px-4 py-3 text-center">
                        <PromoterCopyButton
                          promoter={promoter}
                          copied={copied}
                          copyLabel={copyLabel}
                          copiedLabel={copiedLabel}
                          onCopy={copyLink}
                          className="mx-auto w-full max-w-[8.75rem]"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </>
        )}
      </CardContent>
      {filteredPromoters.length > 0 ? (
        <CardFooter className="border-t bg-card py-3 text-xs text-muted-foreground">
          {countLabel}
        </CardFooter>
      ) : null}
    </Card>
  )
}