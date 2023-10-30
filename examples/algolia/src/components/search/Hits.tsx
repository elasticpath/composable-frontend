import { useHits } from "react-instantsearch";
import { SearchHit } from "./SearchHit";
import NoResults from "./NoResults";
import HitComponent from "./Hit";

export default function Hits(): JSX.Element {
  const { hits } = useHits<SearchHit>();

  if (hits.length) {
    return (
      <div className="grid max-w-[80rem] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {hits.map((hit) => (
          <div
            className="list-none justify-items-stretch rounded-lg animate-fadeIn"
            key={hit.objectID}
          >
            <HitComponent hit={hit} />
          </div>
        ))}
      </div>
    );
  }
  return <NoResults displayIcon={false} />;
}
