"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
}

export default function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
}: PaginationControlsProps) {
  const searchParams = useSearchParams()
  
  const createPageUrl = (page: number, limit?: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    if (limit) {
      params.set("limit", limit.toString())
    }
    return `?${params.toString()}`
  }

  const handlePageSizeChange = (newSize: number) => {
    // When changing page size, reset to page 1
    const params = new URLSearchParams(searchParams)
    params.set("page", "1")
    params.set("limit", newSize.toString())
    window.location.href = `?${params.toString()}`
  }

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-gray-600">
          Items per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-400 cursor-not-allowed">
            Previous
          </span>
        )}

        {/* Page numbers */}
        {getVisiblePages().map((page, index) => (
          <span key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-sm text-gray-400">...</span>
            ) : (
              <Link
                href={createPageUrl(page as number)}
                className={`px-3 py-2 text-sm border rounded ${
                  page === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </Link>
            )}
          </span>
        ))}

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-100 text-gray-400 cursor-not-allowed">
            Next
          </span>
        )}
        </div>
      )}
    </div>
  )
}