import React from "react";
import { usePathname } from "next/navigation";
import {
  Pagination as DisplayPagination,
  PaginationContent,
  PaginationItem, PaginationLink,
} from "../pagination/Pagination";
import { KlevuQueryResult } from "@klevu/core";

export const DEFAULT_LIMIT = 12;

function calculateTotalPages(totalItems: number, limit: number): number {
  // Ensure both totalItems and limit are positive integers
  totalItems = Math.max(0, Math.floor(totalItems));
  limit = Math.max(1, Math.floor(limit));

  // Calculate the total number of pages using the formula
  return Math.ceil(totalItems / limit);
}

export const Pagination = ({page}: {page: KlevuQueryResult}): JSX.Element => {
  const pathname = usePathname();

  if (!page) {
    return <></>;
  }

  const totalPages = calculateTotalPages(page.meta.totalResultsFound, DEFAULT_LIMIT);

  return (
      <DisplayPagination>
        <PaginationContent>
          {[...Array(totalPages).keys()].map((pageNumber) => (
                <PaginationLink
                    key={pageNumber}
                    href={`${pathname}?offset=${
                        pageNumber * DEFAULT_LIMIT
                    }`}
                    isActive={pageNumber === Math.floor((page.meta.offset / DEFAULT_LIMIT))}
                >
                  {pageNumber + 1}
                </PaginationLink>
          ))}
        </PaginationContent>
      </DisplayPagination>
  )
};

export default Pagination;
