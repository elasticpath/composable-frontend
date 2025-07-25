/**
 * Filter utilities for Elastic Path product catalog
 * 
 * Supports the filtering capabilities documented at:
 * https://elasticpath.dev/docs/api/pxm/catalog/get-by-context-all-products#filtering
 */

export interface ProductFilters {
  name?: string           // Filter by exact product name
  sku?: string            // Filter by exact SKU
  productTypes?: string[] // Filter by product types
}

export interface FilterQuery {
  [key: string]: string
}

/**
 * Builds filter query string for Elastic Path API using legacy syntax
 * Legacy syntax: filter=eq(field,value),eq(field2,value2) or filter=in(field,value1,value2)
 * Combines multiple filters using comma separation
 */
export function buildFilterQuery(filters: ProductFilters): FilterQuery {
  const filterParts: string[] = []

  // Name filter - exact match only
  if (filters.name && filters.name.trim()) {
    filterParts.push(`eq(name,${filters.name.trim()})`)
  }

  // SKU filter - exact match only
  if (filters.sku && filters.sku.trim()) {
    filterParts.push(`eq(sku,${filters.sku.trim()})`)
  }

  // Product types filter - can match multiple types
  if (filters.productTypes && filters.productTypes.length > 0) {
    if (filters.productTypes.length === 1) {
      filterParts.push(`eq(product_types,${filters.productTypes[0]})`)
    } else {
      filterParts.push(`in(product_types,${filters.productTypes.join(',')})`)
    }
  }

  if (filterParts.length === 0) {
    return {}
  }

  return {
    filter: filterParts.join(',')
  }
}

/**
 * Parses URL search parameters into ProductFilters object
 */
export function parseFiltersFromUrl(searchParams: URLSearchParams): ProductFilters {
  const filters: ProductFilters = {}

  const name = searchParams.get('name')
  if (name) {
    filters.name = name
  }

  const sku = searchParams.get('sku')
  if (sku) {
    filters.sku = sku
  }

  const productTypes = searchParams.get('product_types')
  if (productTypes) {
    filters.productTypes = productTypes.split(',').filter(Boolean)
  }

  return filters
}

/**
 * Converts ProductFilters to URL search parameters
 */
export function filtersToUrlParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.name) {
    params.set('name', filters.name)
  }

  if (filters.sku) {
    params.set('sku', filters.sku)
  }

  if (filters.productTypes && filters.productTypes.length > 0) {
    params.set('product_types', filters.productTypes.join(','))
  }

  return params
}

/**
 * Checks if any filters are active
 */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return !!(
    filters.name ||
    filters.sku ||
    (filters.productTypes && filters.productTypes.length > 0)
  )
}

/**
 * Clears all filters
 */
export function clearFilters(): ProductFilters {
  return {}
}

/**
 * Common product types for filtering
 */
export const COMMON_PRODUCT_TYPES = [
  'child',
  'parent',
  'bundle',
  'standalone'
] as const

/**
 * Utility to get filter summary text for display
 */
export function getFilterSummary(filters: ProductFilters): string {
  const activeParts: string[] = []

  if (filters.name) {
    activeParts.push(`Name: "${filters.name}"`)
  }

  if (filters.sku) {
    activeParts.push(`SKU: "${filters.sku}"`)
  }

  if (filters.productTypes && filters.productTypes.length > 0) {
    activeParts.push(`Types: ${filters.productTypes.join(', ')}`)
  }

  if (activeParts.length === 0) {
    return 'No filters applied'
  }

  return activeParts.join(' • ')
}