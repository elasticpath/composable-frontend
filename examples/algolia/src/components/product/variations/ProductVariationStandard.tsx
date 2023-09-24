import clsx from "clsx";

interface ProductVariationOption {
  id: string;
  description: string;
  name: string;
}

export type UpdateOptionHandler = (
  variationId: string,
) => (optionId: string) => void;

interface IProductVariation {
  variation: {
    id: string;
    name: string;
    options: ProductVariationOption[];
  };
  updateOptionHandler: UpdateOptionHandler;
  selectedOptionId?: string;
}

const ProductVariationStandard = ({
  variation,
  selectedOptionId,
  updateOptionHandler,
}: IProductVariation): JSX.Element => {
  return (
    <div className="grid gap-2">
      <h2>{variation.name}</h2>
      <div className="flex flex-wrap gap-2">
        {variation.options.map((o) => (
          <button
            className={clsx(
              o.id === selectedOptionId
                ? "bg-brand-primary text-white"
                : "bg-white text-gray-800",
              "p6 rounded-md border px-6 py-3 font-semibold",
            )}
            key={o.id}
            onClick={() => updateOptionHandler(variation.id)(o.id)}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductVariationStandard;
