# Home cartelera carousel poster loading

Desktop cartelera uses a horizontal carousel when there are **more than three** events (`home-events-section.astro`, `home-featured-carousel.ts`). Posters sit in a translated track (`.home-featured__list--carousel`) inside an `overflow: hidden` viewport.

## Symptom

When sliding the carousel (especially **event 5 and later**), poster images could **load again** on each visit to a slide: network activity, skeleton pulse, or a visible flash. Static grids (≤3 events) did not show the issue.

## Root causes

1. **`loading="lazy"` + translated track**  
   Lazy loading is tied to the layout viewport. Cards move with `translate3d`, so slides that leave and re-enter the viewport can be treated as newly visible. Browsers may **fetch again** or reset decode state even though the `<img>` never left the DOM.

2. **Late cartelera client**  
   Carousel UI (and related poster fill wiring) runs via `scheduleHomeCarteleraClientAfterLoad` in `home-cartelera-client.ts` (`window` `load` + `requestIdleCallback`, timeout 3s). Posters that had not finished loading before the user reached deep slides appeared to “load on every slide” the first time; combined with (1), returning to those slides could look like a **reload**.

3. **`<picture>` WebP selection**  
   Card posters use Astro `getImage` output: WebP `<source>` + JPEG fallback `<img>` (`home-event-feature.astro`). Only warming the fallback `src` is not enough; the **WebP** the browser actually paints must be primed too.

4. **Skeleton tied to `[complete]`**  
   `.home-feature__poster-skeleton` hides when the main poster img has `[complete]`. Any brief loss of decode/`complete` during refetch made the pulse skeleton **visible again**, which reads as a reload.

## Fix (layers)

Apply all of the following for carousel routes; do not rely on a single layer.

### 1. Eager loading in SSR (carousel only)

- `HomeEventFeature` accepts `posterLoading` (`lazy` | `eager`).
- Carousel branch uses `homeEventPosterLoadingInCarousel(true)` → **`loading="eager"`** on every card poster (`home-event-poster-loading.ts`).
- First card keeps `fetchpriority="high"` for LCP; the rest stay default.
- Static ≤3-event grid unchanged (`lazy`).

### 2. Early + idle poster priming

`home-featured-carousel-posters.ts`:

- Runs **`tryPrimeHomeFeaturedCarouselPosters()`** as soon as the cartelera page script executes (`home-events-section.astro`), **before** the idle-delayed cartelera client.
- Runs again inside **`initHomeFeaturedCarousel`** and **`initHomeCarteleraClient`** on the track.
- For each main poster (not letterbox fill): force `loading = "eager"`, warm cache via a detached `Image()` (WebP from `<source type="image/webp">` when present, else `src`/`srcset`), call `decode()` when loaded, set **`data-poster-primed`** on `.home-feature__poster-frame`.

### 3. Skeleton lock after first paint

In `home.css`, hide the skeleton when the frame has **`data-poster-primed`** or the main img is `[complete]`, and **`animation: none`** when primed so a refetch does not pulse the placeholder again.

### 4. Letterbox fill (unchanged contract)

Letterbox posters still use a fill `img` with **no** `src`/`srcset` in HTML; `home-feature-poster-fill.ts` copies `main.currentSrc` after load so only **one** URL is requested. Priming does not change that flow.

## Modules and tests

| Area | Path |
| --- | --- |
| Eager vs lazy helper | `src/lib/home-event-poster-loading.ts` |
| Priming + WebP warm | `src/lib/home-featured-carousel-posters.ts` |
| Carousel transform | `src/lib/home-featured-carousel.ts` |
| Client schedule + init order | `src/lib/home-cartelera-client.ts` |
| Card markup | `src/components/home/home-event-feature.astro` |
| Cartelera section | `src/components/home/home-events-section.astro` |

Tests:

- `tests/unit/cartelera-poster-image-load.test.ts` — eager policy + letterbox fill
- `tests/unit/home-featured-carousel-posters.test.ts` — `srcset` pick + primed marker

## Verification

1. Home with **>3** cartelera events, desktop width (≥56rem).
2. Open DevTools → Network, filter Img, disable cache.
3. Load `/`, wait for poster requests to settle.
4. Step carousel through events **5+**, then back; poster URLs should **not** repeat for the same slide.
5. Skeleton pulse should not reappear on slides that already showed a poster.

## Do not

- Re-enable `loading="lazy"` on carousel posters without priming.
- Load a **second** URL on letterbox fill in HTML (see `docs/airtable-cartelera.md` + fill tests).
- Delay all poster work until idle-only cartelera init without an early `tryPrimeHomeFeaturedCarouselPosters()` pass.

## Related

- Build-time posters: `docs/airtable-cartelera.md`
- Carousel hyphen indicators: `home-featured-carousel.ts`, `home.css` (`.home-featured__indicators-*`)