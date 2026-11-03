export const TAXONOMY_FACET_FIELD = resolveTaxonomyFacetField(
  process.env.NEXT_PUBLIC_SEARCH_TAXONOMY_FIELD,
)

export function resolveTaxonomyFacetField(
  configured: string | undefined,
): string | undefined {
  const field = configured?.trim()
  return field ? field : undefined
}

export function taxonomyFacetLabel(field: string): string {
  const key = field.slice(field.lastIndexOf(".") + 1)
  const words = key.replace(/[-_]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}
