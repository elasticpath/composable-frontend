export const STORE_SHAPE_PROBLEMS = [
  "search-not-enabled",
  "taxonomy-field-not-facetable",
] as const

export type StoreShapeProblem = (typeof STORE_SHAPE_PROBLEMS)[number]

export const STORE_SHAPE_PARAM = "store-shape"

type ApiError = { status?: string; title?: string; detail?: string }

const SEARCH_NOT_ENABLED_TITLE = "Search Not Enabled"
const NOT_FACETABLE_DETAIL = /Could not find a facet field named '([^']+)'/

export function storeShapeProblemsFromSearchError(
  error: unknown,
  taxonomyField?: string,
): StoreShapeProblem[] {
  const problems = new Set<StoreShapeProblem>()

  for (const { title, detail } of apiErrors(error)) {
    if (title === SEARCH_NOT_ENABLED_TITLE) {
      problems.add("search-not-enabled")
    }

    const unfacetableField = detail?.match(NOT_FACETABLE_DETAIL)?.[1]
    if (taxonomyField && unfacetableField === taxonomyField) {
      problems.add("taxonomy-field-not-facetable")
    }
  }

  return [...problems]
}

function apiErrors(error: unknown): ApiError[] {
  if (typeof error !== "object" || error === null || !("errors" in error)) {
    return []
  }

  const { errors } = error as { errors: unknown }
  return Array.isArray(errors) ? (errors as ApiError[]) : []
}

export function storeShapeRequirement(
  problem: StoreShapeProblem,
  taxonomyField?: string,
): { name: string; remedy: string } {
  switch (problem) {
    case "search-not-enabled":
      return {
        name: "Catalog Search is not enabled for this shopper's catalog",
        remedy:
          "Search answers the same way whichever of these is missing, so check each: Catalog Search is enabled for the store; the catalog the shopper resolves to has search enabled; and that catalog has been published since search was enabled on it, so a search index exists for the release.",
      }
    case "taxonomy-field-not-facetable":
      return {
        name: `NEXT_PUBLIC_SEARCH_TAXONOMY_FIELD names "${taxonomyField ?? "a field"}", which search cannot facet on`,
        remedy:
          "Run `pnpm provision:search-facet` with admin credentials in your shell. It registers the field as facetable and waits for the reindex. Or unset the variable and rebuild to hide the facet.",
      }
  }
}

export function parseStoreShapeProblems(
  values: string | string[] | undefined,
): StoreShapeProblem[] {
  const candidates = Array.isArray(values) ? values : values ? [values] : []
  return STORE_SHAPE_PROBLEMS.filter((problem) => candidates.includes(problem))
}

export function createStoreShapeErrorPath(
  lang: string,
  problems: StoreShapeProblem[],
  from: string,
): string {
  const params = new URLSearchParams()
  problems.forEach((problem) => params.append(STORE_SHAPE_PARAM, problem))
  params.set("from", from)
  return `/${lang}/configuration-error?${params.toString()}`
}

export function searchReturnPath(
  node: string[] | undefined,
  query: Record<string, string | string[] | undefined>,
): string {
  const path = ["/search", ...(node ?? []).map(encodeURIComponent)].join("/")
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    for (const entry of Array.isArray(value) ? value : value ? [value] : []) {
      params.append(key, entry)
    }
  }

  const search = params.toString()
  return search ? `${path}?${search}` : path
}
