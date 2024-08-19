import NoResults from "./NoResults";
import HitComponent from "./Hit";
import { KlevuRecord } from "@klevu/core";

type HitsProps = {
  data: KlevuRecord[];
  clickEvent?: (params: { productId: string}) => void
}

export default function Hits({ data, clickEvent }: HitsProps): JSX.Element {
  if (data.length) {
    return (
      <div className="grid max-w-[80rem] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((hit) => {
          return (
            <div
              className="list-none justify-items-stretch rounded-lg animate-fadeIn"
              key={hit.id}
            >
              <HitComponent hit={hit} clickEvent={clickEvent} />
            </div>
          );
        })}
      </div>
    );
  }
  return <NoResults />;
}
