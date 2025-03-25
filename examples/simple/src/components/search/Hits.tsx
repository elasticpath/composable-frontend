import NoResults from "./NoResults";
import HitComponent from "./Hit";
import { useProducts } from "./ProductsProvider";

import type { JSX } from "react";

export default function Hits(): JSX.Element {
  const { page } = useProducts();

  if (!page) {
    return <NoResults displayIcon={false} />;
  }

  if (page.data && page.data.length > 0) {
    return (
      <div className="grid max-w-[80rem] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {page.data.map((hit) => {
          return (
            <div
              className="list-none justify-items-stretch rounded-lg animate-fadeIn"
              key={hit.id!}
            >
              <HitComponent hit={hit} mainImages={page.included?.main_images} />
            </div>
          );
        })}
      </div>
    );
  }
  return <NoResults displayIcon={false} />;
}
