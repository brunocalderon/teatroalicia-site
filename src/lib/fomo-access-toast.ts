const CHILEAN_FOMO_FIRST_NAMES = [
  "Valentina",
  "Sebastián",
  "Camila",
  "Matías",
  "Javiera",
  "Benjamín",
  "Catalina",
  "Felipe",
  "Antonia",
  "Diego",
  "Francisca",
  "Nicolás",
  "Isidora",
  "Tomás",
  "Martina",
  "Ignacio",
  "Sofía",
  "Vicente",
  "Amanda",
  "Cristóbal",
  "Fernanda",
  "Maximiliano",
  "Rocío",
  "Alonso",
  "Constanza",
] as const

const ACCESS_TIME_AGO_CHOICES = [
  "un momento",
  "2 minutos",
  "3 minutos",
  "5 minutos",
  "8 minutos",
  "12 minutos",
  "15 minutos",
  "18 minutos",
  "22 minutos",
  "27 minutos",
  "34 minutos",
  "41 minutos",
] as const

function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function formatFomoAccessMessage(name: string, timeAgo: string): string {
  return `${name} solicitó un acceso hace ${timeAgo}`
}

/** Picks a random name/time pair, avoiding repeats in `usedNameIndices` until the pool is exhausted. */
export function pickRandomFomoAccessMessage(
  usedNameIndices: Set<number> = new Set(),
): string {
  const poolSize = CHILEAN_FOMO_FIRST_NAMES.length
  if (usedNameIndices.size >= poolSize) {
    usedNameIndices.clear()
  }

  let nameIndex = randomInt(poolSize)
  let guard = 0
  while (usedNameIndices.has(nameIndex) && guard < poolSize * 2) {
    nameIndex = randomInt(poolSize)
    guard += 1
  }
  usedNameIndices.add(nameIndex)

  const name = CHILEAN_FOMO_FIRST_NAMES[nameIndex]!
  const timeAgo =
    ACCESS_TIME_AGO_CHOICES[randomInt(ACCESS_TIME_AGO_CHOICES.length)]!

  return formatFomoAccessMessage(name, timeAgo)
}