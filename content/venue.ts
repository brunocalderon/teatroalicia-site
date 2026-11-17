import { venueConfigSchema, type VenueConfig } from "../src/lib/venue-schema"

/**
 * Public venue facts for Schema.org JSON-LD (`src/lib/schema-org/*`).
 * Update values here; they are validated at build time.
 */
export const venueConfig: VenueConfig = venueConfigSchema.parse({
  name: "Teatro Alicia",
  description:
    "Teatro Alicia es un espacio de eventos y conciertos en Lo Barnechea, Santiago: música en vivo, experiencias nocturnas y programación cultural con bar, guardarropía y estacionamiento. Abre al público según el calendario de cada evento.",
  slogan: "Música en vivo y experiencias nocturnas en Santiago",
  keywords: [
    "Centro de eventos",
    "Sala de conciertos",
    "Música en vivo",
    "Música electrónica",
    "Eventos corporativos",
    "Eventos privados",
    "Eventos culturales",
    "Vida nocturna",
    "Producción de eventos",
    "Arriendo de espacios para eventos",
  ],
  logoPath: "/logo.svg",
  imagePath: "/this-is-alicia.jpg",
  schemaTypes: [
    "EventVenue",
    "MusicVenue",
    "EntertainmentBusiness",
    "NightClub",
  ],
  address: {
    streetAddress: "Av. Raúl Labbé 14998",
    addressLocality: "Lo Barnechea",
    addressRegion: "Región Metropolitana",
    postalCode: "7710240",
    addressCountry: "CL",
  },
  geo: {
    latitude: -33.3620342,
    longitude: -70.4935642,
  },
  googleMapsUrl: "https://www.google.com/maps?cid=8756366332775947293",
  googlePlaceId: "ChIJYyhp4ZDLYpYRHdxMVMnchHk",
  contact: {
    email: "contacto@teatroalicia.cl",
    contactFormUrl: "https://teatroalicia.com/contacto",
    // telephone: "+56992724680",
    // whatsappTelephone: "+56989012354",
    // whatsappUrl: "https://wa.me/56989012354",
  },
  openingHoursSpecification: [],
  openingHoursNote:
    "Sin horario fijo: el recinto opera a demanda según cada evento programado. Consulta fecha y hora en la ficha del evento o en la boletería.",
  priceRange: "$$",
  currenciesAccepted: ["CLP"],
  paymentAccepted: ["Efectivo", "Tarjetas de crédito", "Tarjetas de débito"],
  maximumAttendeeCapacity: 1500,
  amenities: {
    barFood: true,
    barFoodDescription: "Bar y servicio de comida en el recinto.",
    cloakroom: true,
    parking: true,
    parkingDescription: "Estacionamiento cercano.",
  },
  sameAs: [
    "https://www.instagram.com/teatroalicia.scl/",
    "https://www.facebook.com/165032207039077/",
  ],
  facebookPageUrl: "https://www.facebook.com/165032207039077/",
})

export default venueConfig