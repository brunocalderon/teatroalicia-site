# Schema.org JSON-LD

Structured data is generated at build time and embedded as `<script type="application/ld+json">`. Canonical entity URLs use **`https://teatroalicia.com/`** (see [`src/lib/schema-org/canonical-origin.ts`](../src/lib/schema-org/canonical-origin.ts)).

## Venue data

Edit [`content/venue.ts`](../content/venue.ts), validated by [`src/lib/venue-schema.ts`](../src/lib/venue-schema.ts).

Persistent venue `@id`: `https://teatroalicia.com/#teatro-alicia`

Do not add self-serving `aggregateRating`, generic ticket `makesOffer`, or fixed `openingHoursSpecification` when hours are event-driven. Use `openingHoursNote` + `additionalProperty` instead.

## Event data (invitation forms)

Optional frontmatter in [`content/forms/`](../content/forms/):

| Field | Description |
|-------|-------------|
| `eventId` | Stable occurrence id (required with `eventStart`) |
| `eventStart` / `eventEnd` | ISO 8601 with **America/Santiago** offset |
| `eventKind` | `general`, `social`, `music`, `social-music`, `business`, `theater` |
| `organizer` / `organizerIsVenue` | Third-party organizer or Teatro Alicia–produced concert |
| `performer` | `{ name, kind: Person \| MusicGroup \| PerformingGroup \| Organization }` |
| `ticketOffers` / `ticketUrl` | Paid offers (`CLP` when price is set) |
| `invitationOnly` | Guest-pass **application** offer (not free admission) |

Event `@id`: `https://teatroalicia.com/#event-{eventId}`

## Page graphs

| Route | Graph |
|-------|--------|
| `/` | `WebSite`, `WebPage` (`#webpage`), venue |
| Invitation form | `WebSite`, venue, `WebPage`, full event, organizers/performers when defined |
| Thank-you | None |

Upcoming `ItemList` (`#upcoming-events`) is emitted only on pages that actually list upcoming events (not on the current homepage).

Builders: [`src/lib/schema-org/`](../src/lib/schema-org/).

## Tests

```bash
npm run test:unit
```

## Extract built JSON-LD

After a production build:

```bash
npm run extract:json-ld          # print all graphs to stdout
npm run extract:json-ld -- --write   # write dist/json-ld/*.json
npm run build:json-ld            # build, then print
```

Validate deployed URLs with [validator.schema.org](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results) after release.