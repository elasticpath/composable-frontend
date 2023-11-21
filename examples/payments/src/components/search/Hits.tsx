import NoResults from "./NoResults";
import HitComponent from "./Hit";
import { useProducts } from "./ProductsProvider";

export default function Hits(): JSX.Element {
  const { page } = useProducts();

  if (!page) {
    return <NoResults displayIcon={false} />;
  }

  if (page.data.length) {
    return (
      <div className="grid max-w-[80rem] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {page.data.map((hit) => {
          const {
            response: { id },
          } = hit;
          return (
            <div
              className="list-none justify-items-stretch rounded-lg animate-fadeIn"
              key={id}
            >
              <HitComponent hit={hit} />
            </div>
          );
        })}
      </div>
    );
  }
  return <NoResults displayIcon={false} />;
}
