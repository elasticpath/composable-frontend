import React from "react";
import { usePagination } from "react-instantsearch";
import clsx from "clsx";

export const Pagination = (): JSX.Element => {
  const { pages, currentRefinement, canRefine, refine } = usePagination();

  return (
    <div className={clsx(canRefine ? "block" : "none")}>
      <div className="flex justify-center">
        {pages.map((page) => (
          <button
            className={clsx(
              currentRefinement === page ? "bg-brand-primary" : "bg-gray-100",
              currentRefinement === page ? "text-white" : "text-black",
              "primary-btn w-fit cursor-pointer",
            )}
            key={page}
            onClick={() => refine(page)}
            disabled={!canRefine}
          >
            {page + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pagination;
