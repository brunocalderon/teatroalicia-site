function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (trimmed.length === 0) {
    return trimmed
  }
  return trimmed.replace(/\/+$/, "") || "/"
}

/** Paths that exist in both CMS and another route set (e.g. form markdown). */
export function findCmsPathCollisions(
  cmsPaths: readonly string[],
  reservedPaths: readonly string[],
): string[] {
  const reserved = new Set(reservedPaths.map(normalizePath))
  const collisions: string[] = []

  for (const cmsPath of cmsPaths) {
    const normalized = normalizePath(cmsPath)
    if (reserved.has(normalized)) {
      collisions.push(normalized)
    }
  }

  return [...new Set(collisions)].sort((a, b) => a.localeCompare(b))
}

/** Duplicate `path` values within the CMS collection. */
export function findDuplicateCmsPaths(
  cmsPaths: readonly string[],
): string[] {
  const seen = new Map<string, number>()

  for (const cmsPath of cmsPaths) {
    const normalized = normalizePath(cmsPath)
    seen.set(normalized, (seen.get(normalized) ?? 0) + 1)
  }

  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([path]) => path)
    .sort((a, b) => a.localeCompare(b))
}