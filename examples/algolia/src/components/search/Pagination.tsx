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
              "flex w-full items-center justify-center rounded-md bg-brand-primary px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-brand-highlight w-fit cursor-pointer",
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
