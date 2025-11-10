import React from "react";
import { useProducts } from "./ProductsProvider";
import { usePathname } from "next/navigation";
import {
  Pagination as DisplayPagination,
  PaginationContent,
  PaginationItem, PaginationLink,
} from "../pagination/Pagination";


function calculateTotalPages(totalItems: number, limit: number): number {
  // Ensure both totalItems and limit are positive integers
  totalItems = Math.max(0, Math.floor(totalItems));
  limit = Math.max(1, Math.floor(limit));

  // Calculate the total number of pages using the formula
  return Math.ceil(totalItems / limit);
}

export const Pagination = (): JSX.Element => {
  const { page } = useProducts();
  const pathname = usePathname();

  if (!page) {
    return <></>;
  }

  const {
    meta: {
      results: { total: totalResults = 0 },
    },
  } = page;

  const totalPages = calculateTotalPages(totalResults, page.meta.page.limit);

  return (
      <DisplayPagination>
        <PaginationContent>
          {[...Array(totalPages).keys()].map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                    href={`${pathname}?limit=${page.meta.page.limit}&offset=${
                        pageNumber * page.meta.page.limit
                    }`}
                    isActive={pageNumber + 1 === page.meta.page.current}
                >
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
          ))}
        </PaginationContent>
      </DisplayPagination>
  )
};

export default Pagination;
