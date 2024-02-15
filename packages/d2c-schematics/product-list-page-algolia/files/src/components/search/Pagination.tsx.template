import React from "react";
import { usePagination } from "react-instantsearch";

import {
  Pagination as DisplayPagination,
  PaginationButton,
  PaginationContent,
  PaginationItem,
} from "../pagination/Pagination";

export const Pagination = (): JSX.Element => {
  const { pages, currentRefinement, canRefine, refine } = usePagination();
  return (
    <DisplayPagination>
      <PaginationContent>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationButton
              isActive={currentRefinement === pageNumber}
              onClick={() => refine(pageNumber)}
              disabled={!canRefine}
            >
              {pageNumber + 1}
            </PaginationButton>
          </PaginationItem>
        ))}
      </PaginationContent>
    </DisplayPagination>
  );
};

export default Pagination;
