import {
  FORM_PAGE_BACKGROUND_HD_IMAGE_SET,
  FORM_PAGE_BACKGROUND_LQIP_DATA_URI,
} from "@/lib/form-page-background"

export type SitePageBackdropOptions = {
  /**
   * Home cartelera hero covers this band — keep the global LQIP backdrop hidden
   * in inline CSS so deferred page CSS cannot flash the form background first.
   */
  primaryHeroBackground?: boolean
}

/** LQIP backdrop on `::before`, HD `image-set` after `body.form-page-bg-hd`. */
export function sitePageBackdropCss(
  mainClass: string,
  options?: SitePageBackdropOptions,
): string {
  const sel = `.${mainClass}`
  let css = `body:has(${sel}){position:relative;background-color:transparent;min-height:100dvh}body:has(${sel})::before{content:"";position:fixed;inset:0;z-index:-1;background-color:#000;background-image:url(${JSON.stringify(FORM_PAGE_BACKGROUND_LQIP_DATA_URI)});background-size:cover;background-position:center;background-repeat:no-repeat}body.form-page-bg-hd:has(${sel})::before{background-image:${FORM_PAGE_BACKGROUND_HD_IMAGE_SET}}`

  if (options?.primaryHeroBackground) {
    css += `body:has(${sel} #cartelera .home-hero__carousel)::before{opacity:0!important;visibility:hidden;pointer-events:none}`
  }

  return css
}