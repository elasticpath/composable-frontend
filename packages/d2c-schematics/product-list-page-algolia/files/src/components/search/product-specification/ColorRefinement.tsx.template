import { useRefinementList } from "react-instantsearch";

const ColorRefinement = ({ attribute }: { attribute: string }) => {
  const { items, refine } = useRefinementList({ attribute });

  return (
    <>
      <h3 className="mt-5 pb-1 font-semibold">Color</h3>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((o) => (
          <div
            className={`rounded-full ${
              o.isRefined ? "border-2 border-brand-primary" : ""
            }`}
            key={o.value}
          >
            <button
              className="rounded-full border border-gray-200 p-4"
              onClick={() => refine(o.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ColorRefinement;
