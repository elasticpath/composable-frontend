"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import SearchFilter from "./SearchFilter"
import ProductTypesFilter from "./ProductTypesFilter"
import { 
  ProductFilters, 
  parseFiltersFromUrl, 
  filtersToUrlParams, 
  hasActiveFilters, 
  clearFilters,
  getFilterSummary
} from "../../lib/filters"

interface FilterControlsProps {
  className?: string
}

export default function FilterControls({ 
  className = "" 
}: FilterControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentFilters = parseFiltersFromUrl(searchParams)
  const hasFilters = hasActiveFilters(currentFilters)

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    const params = new URLSearchParams(searchParams)
    
    // Remove existing filter params
    params.delete('name')
    params.delete('sku')
    params.delete('product_types')
    
    // Add new filter params
    const filterParams = filtersToUrlParams(newFilters)
    filterParams.forEach((value, key) => {
      params.set(key, value)
    })
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const handleSearchFiltersChange = (name: string, sku: string) => {
    updateFilters({ ...currentFilters, name, sku })
  }

  const handleProductTypesChange = (productTypes: string[]) => {
    updateFilters({ ...currentFilters, productTypes })
  }

  const handleClearAllFilters = () => {
    updateFilters(clearFilters())
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filter Products</h3>
        {hasFilters && (
          <button
            onClick={handleClearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div>
        <SearchFilter
          nameValue={currentFilters.name || ""}
          skuValue={currentFilters.sku || ""}
          onFiltersChange={handleSearchFiltersChange}
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap gap-4">
        <ProductTypesFilter
          selectedTypes={currentFilters.productTypes || []}
          onChange={handleProductTypesChange}
        />
      </div>

      {/* Filter Summary */}
      {hasFilters && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Active Filters</p>
              <p className="text-sm text-blue-700 mt-1">
                {getFilterSummary(currentFilters)}
              </p>
            </div>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}