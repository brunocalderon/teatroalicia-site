const PLACEHOLDER = /\{(\w+)\}/g

export function formatHomeContentTemplate(
  template: string,
  values: Record<string, string | number | undefined>,
): string {
  return template.replace(PLACEHOLDER, (match, key: string) => {
    const value = values[key]
    return value === undefined || value === "" ? match : String(value)
  })
}