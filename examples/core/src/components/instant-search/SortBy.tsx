"use client"
import type { JSX } from "react"
import { useSortBy } from "react-instantsearch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select/Select"
import { buildSortByItems } from "src/lib/sort-by-items"

export function SortBy({
  currencyCode,
}: {
  currencyCode: string
}): JSX.Element {
  const { canRefine, currentRefinement, options, refine } = useSortBy({
    items: buildSortByItems(currencyCode),
  })

  const selected = options.some((option) => option.value === currentRefinement)
    ? currentRefinement
    : undefined

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="search-sort-by"
        className="whitespace-nowrap text-sm text-gray-600"
      >
        Sort by
      </label>
      <Select value={selected} onValueChange={refine} disabled={!canRefine}>
        <SelectTrigger
          id="search-sort-by"
          aria-label="Sort by"
          className="w-[180px] bg-white"
        >
          <SelectValue placeholder={options[0]?.label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
