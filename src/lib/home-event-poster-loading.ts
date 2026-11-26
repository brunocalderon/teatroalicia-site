/** Carousel slides use transform; lazy posters can reload when sliding back into view. */
export function homeEventPosterLoadingInCarousel(
  inCarousel: boolean,
): "lazy" | "eager" {
  return inCarousel ? "eager" : "lazy"
}