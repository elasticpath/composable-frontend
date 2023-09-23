import { Fragment } from "react";
import { ProductResponse } from "@moltin/sdk";

interface IProductComponentsProps {
  components: ProductResponse[];
  product: ProductResponse;
}

const ProductComponents = ({
  components,
  product,
}: IProductComponentsProps): JSX.Element => {
  return (
    <div className="flex flex-row flex-wrap">
      {Object.keys(product.attributes.components).map((cmpName) => {
        const allOptions = product.attributes.components[cmpName].options;
        const bundle_configuration = product.meta.bundle_configuration;
        return (
          <div className="m-2" key={cmpName}>
            <span className="mb-2">{cmpName}</span>
            {bundle_configuration ? (
              <div className="relative min-w-[21.875rem] cursor-pointer rounded-lg border p-6">
                <div className="flex flex-col">
                  {allOptions.map(({ id, quantity }, index) => {
                    const optionData = components.find(
                      (item) => item.id === id,
                    )!;
                    return (
                      <Fragment key={id}>
                        <label className="cursor-pointer">
                          <div className="flex gap-4">
                            <input
                              name={id}
                              type="radio"
                              key={id}
                              value={JSON.stringify({ [id]: quantity })}
                              disabled={
                                Object.keys(
                                  bundle_configuration.selected_options[
                                    cmpName
                                  ],
                                )[0] !== id
                              }
                            />
                            <div>
                              <h4 className="mb-2 mt-4 line-clamp-1 font-semibold">
                                {optionData.attributes.name}
                              </h4>
                              <div className="flex flex-col">
                                <span className="absolute right-0 top-0 mr-3 mt-3 rounded-md bg-gray-200 px-2 text-sm">
                                  {optionData.attributes.sku}
                                </span>
                                <span className="mb-2 w-fit rounded-md bg-gray-200 px-2 text-sm">
                                  Quantity: {quantity}
                                </span>
                                <span>
                                  {product.meta.component_products?.[id]
                                    ?.display_price.without_tax.formatted ||
                                    null}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                        {allOptions.length > 1 &&
                        index + 1 !== allOptions.length ? (
                          <hr className="my-4" />
                        ) : null}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default ProductComponents;
