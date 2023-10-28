import { useRefinementList } from "react-instantsearch";

const BrandRefinement = ({ attribute }: { attribute: string }) => {
  const { items, refine } = useRefinementList({ attribute });

  return (
    <div className="flex flex-col gap-2">
      <h3 className="mt-5 pb-1 font-semibold">Brand</h3>
      {items.map((item) => (
        <div className="flex items-center" key={item.value}>
          <label className="mr-2 cursor-pointer">
            <input
              className="mr-2"
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
            />
            {item.label}
          </label>
          <div className="ml-1 flex items-center justify-center rounded-md border bg-gray-200 px-1.5 py-0.5 text-xs font-medium">
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandRefinement;
