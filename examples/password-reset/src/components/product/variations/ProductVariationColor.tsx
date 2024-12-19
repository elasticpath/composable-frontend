import clsx from "clsx";
import { colorLookup } from "../../../lib/color-lookup";
import type { useVariationProduct } from "@elasticpath/react-shopper-hooks";

interface ProductVariationOption {
  id: string;
  description: string;
  name: string;
}

interface IProductVariation {
  variation: {
    id: string;
    name: string;
    options: ProductVariationOption[];
  };
  updateOptionHandler: ReturnType<
    typeof useVariationProduct
  >["updateSelectedOptions"];
  selectedOptionId?: string;
}

const ProductVariationColor = ({
  variation,
  selectedOptionId,
  updateOptionHandler,
}: IProductVariation): JSX.Element => {
  return (
    <div className="grid gap-2">
      <h2>{variation.name}</h2>
      <div className="flex flex-wrap items-center gap-2">
        {variation.options.map((o) => (
          <div
            className={clsx(
              o.id === selectedOptionId ? "border-2 border-brand-primary" : "",
              "rounded-full p-0.5",
            )}
            key={o.id}
          >
            <button
              type="button"
              className={clsx(
                colorLookup[o.name.toLowerCase()],
                "rounded-full border border-gray-200 p-4",
              )}
              onClick={() => updateOptionHandler(variation.id, o.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductVariationColor;
