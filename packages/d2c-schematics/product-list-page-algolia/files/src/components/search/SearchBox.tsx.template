import { useSearchBox } from "react-instantsearch-hooks-web";
import React, { useState } from "react";
import { useDebouncedEffect } from "../../lib/use-debounced";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function SearchBox(): JSX.Element {
  const { query, refine, clear } = useSearchBox();
  const [search, setSearch] = useState<string>(query);

  useDebouncedEffect(
    () => {
      if (search !== query) {
        refine(search);
      }
    },
    400,
    [search],
  );

  return (
    <div>
      <div className="relative flex items-center">
        <input
          className="w-full rounded-md bg-gray-50 px-12 py-3"
          placeholder="Search"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
        <MagnifyingGlassIcon
          className="absolute ml-5"
          width={16}
          height={16}
          strokeWidth={1}
          color="#9ca3af"
        />
      </div>
    </div>
  );
}
