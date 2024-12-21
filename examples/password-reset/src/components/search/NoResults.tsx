import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export const NoResults = ({
  displayIcon = true,
}: {
  displayIcon?: boolean;
}): JSX.Element => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center">
        {displayIcon ? (
          <div className="mb-4 h-24 w-24 bg-gray-200">
            <MagnifyingGlassIcon width={10} height={10} />
          </div>
        ) : null}
        <span>No matching results</span>
      </div>
    </div>
  );
};

export default NoResults;
