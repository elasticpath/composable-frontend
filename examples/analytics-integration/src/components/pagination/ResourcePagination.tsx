"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_PAGINATION_LIMIT } from "../../lib/constants";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";
import { useCallback } from "react";

export function ResourcePagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Number(searchParams.get("limit")) || DEFAULT_PAGINATION_LIMIT;

  // Use floor to correctly translate offset => currentPage
  const currentPage = Math.floor(offset / limit) + 1;

  // Helper to build page URLs
  const createPageURL = useCallback(
    (pageNumber: number) => {
      // searchParams is read-only in Next 13, so clone it first
      const params = new URLSearchParams(searchParams.toString());
      params.set("offset", String((pageNumber - 1) * limit));
      params.set("limit", String(limit));
      return `${pathname}?${params.toString()}`;
    },
    [limit, pathname, searchParams],
  );

  // If total pages <= 1, hide pagination
  if (totalPages <= 1) {
    return null;
  }

  // Generate the array of pages (numbers + possibly "..." entries)
  const resultingPages = pagination(currentPage, totalPages, 3);

  // Next / Previous boundaries
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        {hasPrev && (
          <PaginationItem>
            <PaginationPrevious href={createPageURL(currentPage - 1)} />
          </PaginationItem>
        )}

        {/* Page links (numbers + ellipses) */}
        {resultingPages.map((page, index) => {
          // If the pagination function returns "..." as a separator:
          if (page === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <span>…</span>
              </PaginationItem>
            );
          }
          // Otherwise it's a real page number
          const pageNumber = Number(page);
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink href={createPageURL(pageNumber)}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next */}
        {hasNext && (
          <PaginationItem>
            <PaginationNext href={createPageURL(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

// Helper utilities
function getRange(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * pagination() returns an array of page numbers and possibly string ellipses "..." entries.
 * @param currentPage The current active page (1-based).
 * @param pageCount   Total number of pages.
 * @param pagesShown  Desired "window" size.  (Minimum is set below.)
 */
function pagination(
  currentPage: number,
  pageCount: number,
  pagesShown: number,
  MINIMUM_PAGE_SIZE = 5,
) {
  currentPage = clamp(currentPage, 1, pageCount);
  pagesShown = clamp(pagesShown, MINIMUM_PAGE_SIZE, pageCount);

  const centerPagesShown = pagesShown - 5;
  const boundaryPagesShown = pagesShown - 3;
  let delta: number;

  if (pageCount <= pagesShown) {
    // If the total pages are less than or equal to pagesShown, just return all pages
    delta = pagesShown;
  } else {
    // If near the start or end, show boundaryPagesShown.
    // Otherwise (in the "middle"), show centerPagesShown.
    delta =
      currentPage < boundaryPagesShown ||
      currentPage > pageCount - boundaryPagesShown
        ? boundaryPagesShown
        : centerPagesShown;
  }

  const range = {
    start: Math.round(currentPage - delta / 2),
    end: Math.round(currentPage + delta / 2),
  };

  // Tweak boundaries
  if (range.start - 1 === 1 || range.end + 1 === pageCount) {
    range.start += 1;
    range.end += 1;
  }

  let pages: (string | number)[] =
    currentPage > delta
      ? getRange(
          Math.min(range.start, pageCount - delta),
          Math.min(range.end, pageCount),
        )
      : getRange(1, Math.min(pageCount, delta + 1));

  if (currentPage > pageCount - boundaryPagesShown && pageCount > pagesShown) {
    pages = getRange(pageCount - delta, pageCount);
  }

  const withDots = (value: number, pair: (string | number)[]) =>
    pages.length + 1 !== pageCount ? pair : [value];

  const lastPage = pages[pages.length - 1];

  // If the first page in the range isn't 1, add leading "..."
  if (pages[0] !== 1) {
    pages = withDots(1, [1, "..."]).concat(pages);
  }

  // If the last page in the range isn't the last actual page, add trailing "..."
  if (lastPage && Number(lastPage) < pageCount) {
    pages = pages.concat(withDots(pageCount, ["...", pageCount]));
  }

  return pages;
}
