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

export function ResourcePagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get("offset")) || 0;
  const limit = Number(searchParams.get("limit")) || DEFAULT_PAGINATION_LIMIT;

  const currentPage = Math.ceil(offset / limit) + 1 || 1;
  const resultingPages = pagination(currentPage, totalPages, 3);

  const createPageURL = (limit: number, pageNumber: string | number) => {
    const params = new URLSearchParams(searchParams);
    params.set("offset", (limit * Number(pageNumber) - limit).toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        {resultingPages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink href={createPageURL(limit, pageNumber)}>
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

const getRange = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const clamp = (number: number, lower: number, upper: number) => {
  return Math.min(Math.max(number, lower), upper);
};

const pagination = (
  currentPage: number,
  pageCount: number,
  pagesShown: number,
  MINIMUM_PAGE_SIZE: number = 5,
) => {
  let delta: number;
  currentPage = clamp(currentPage, 1, pageCount);
  pagesShown = clamp(pagesShown, MINIMUM_PAGE_SIZE, pageCount);
  const centerPagesShown = pagesShown - 5;
  const boundaryPagesShown = pagesShown - 3;

  if (pageCount <= pagesShown) {
    delta = pagesShown;
  } else {
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

  if (pages[0] !== 1) {
    pages = withDots(1, [1, "..."]).concat(pages);
  }

  if (lastPage && Number(lastPage) < pageCount) {
    pages = pages.concat(withDots(pageCount, ["...", pageCount]));
  }

  return pages;
};
