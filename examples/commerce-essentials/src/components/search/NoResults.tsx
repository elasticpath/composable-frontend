import React from "react";

export const NoResults = (): JSX.Element => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center">
        <span>No matching results</span>
      </div>
    </div>
  );
};

export default NoResults;
