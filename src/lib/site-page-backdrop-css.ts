import {
  FORM_PAGE_BACKGROUND_HD_IMAGE_SET,
  FORM_PAGE_BACKGROUND_LQIP_DATA_URI,
} from "@/lib/form-page-background"

/** LQIP backdrop on `::before`, HD `image-set` after `body.form-page-bg-hd`. */
export function sitePageBackdropCss(mainClass: string): string {
  const sel = `.${mainClass}`
  return `body:has(${sel}){position:relative;background-color:transparent;min-height:100dvh}body:has(${sel})::before{content:"";position:fixed;inset:0;z-index:-1;background-color:#000;background-image:url(${JSON.stringify(FORM_PAGE_BACKGROUND_LQIP_DATA_URI)});background-size:cover;background-position:center;background-repeat:no-repeat}body.form-page-bg-hd:has(${sel})::before{background-image:${FORM_PAGE_BACKGROUND_HD_IMAGE_SET}}`
}