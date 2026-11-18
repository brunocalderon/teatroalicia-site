import {
  homeContentSchema,
  type HomeContent,
} from "../src/lib/home-content-schema"

/**
 * Home page marketing copy (hero, bands, meta). Venue facts for JSON-LD live in
 * `content/venue.ts`.
 */
export const homeContent: HomeContent = homeContentSchema.parse({
  meta: {
    title: "Teatro Alicia — Música en vivo y experiencias nocturnas en Santiago",
    description:
      "Teatro Alicia es un espacio de eventos y conciertos en Lo Barnechea, Santiago: música en vivo, experiencias nocturnas y programación cultural con bar, guardarropía y estacionamiento. Abre al público según el calendario de cada evento.",
  },
  hero: {
    kicker: "Lo Barnechea, Chile",
    slogan: "Música en vivo y experiencias nocturnas en Santiago",
    lead: "Teatro Alicia es un espacio de eventos y conciertos en Lo Barnechea, Santiago: música en vivo, experiencias nocturnas y programación cultural con bar, guardarropía y estacionamiento.",
  },
  cartelera: {
    heading: "Cartelera",
    emptyTitle: "Próximos eventos",
    emptyLead:
      "Aún no hay eventos publicados en el sitio. Sigue la programación en nuestras redes.",
    emptyInstagramCta: "Ver Instagram",
  },
  venueSection: {
    kicker: "El recinto",
    title: "Los espacios",
    body: "Teatro Alicia es un recinto de eventos y conciertos en la comuna de Lo Barnechea, Santiago: Nuestra oferta de eventos cuenta con fiestas, música en vivo, experiencias nocturnas y programación cultural. Contamos con servicios de bar, guardarropía y estacionamiento en el exterior del recinto.",
    capacityNote:
      "Espacios versátiles que se adaptan a cada experiencia, con capacidad total de hasta 1.500 personas, según la configuración y el formato de tu evento.",
    photoAlt: "Interior y ambiente de {name}",
  },
  offeringsSection: {
    kicker: "Servicios",
    title: "Vive Teatro Alicia",
  },
  offerings: {
    liveMusic: {
      badge: "Experiencia",
      title: "Música en vivo",
      body: "Conciertos, DJ sets y noches especiales pensadas para el audio y la energía del público.",
    },
    barFood: {
      badge: "En el lugar",
      title: "Bar y comida",
      bodyFallback: "Bar y servicio de comida durante los eventos.",
    },
    maps: {
      badge: "Ubicación",
      title: "Cómo llegar",
      body: "{streetAddress}, {addressLocality}.",
      cta: "Abrir en Maps",
    },
    amenities: {
      badge: "Comodidades",
      title: "Servicios del recinto",
    },
    corporate: {
      badge: "Corporativo",
      title: "Eventos corporativos",
      body: "Activaciones y lanzamientos con un espacio versátil en Lo Barnechea.",
      cta: "Escríbenos",
    },
    private: {
      badge: "Privado",
      title: "Eventos privados",
      body: "Fiestas y celebraciones a medida con bar y servicios del recinto.",
      cta: "Consultar",
    },
  },
})

export default homeContent