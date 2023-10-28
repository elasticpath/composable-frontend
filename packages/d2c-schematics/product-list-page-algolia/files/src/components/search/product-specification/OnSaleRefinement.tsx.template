import { useToggleRefinement } from "react-instantsearch";

const OnSaleRefinement = ({ attribute }: { attribute: string }) => {
  const { value, refine } = useToggleRefinement({ attribute });

  return (
    <>
      <h3 className="mt-5 pb-1 font-semibold">Sale</h3>
      <div className="flex flex-row gap-2">
        <h3 className="font-medium">On sale products</h3>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            value=""
            className="peer sr-only"
            checked={value.isRefined}
            onChange={(e) => refine({ isRefined: !e.target.checked })}
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>
    </>
  );
};

export default OnSaleRefinement;
