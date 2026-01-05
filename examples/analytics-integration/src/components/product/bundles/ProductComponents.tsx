import { ProductComponent } from "./ProductComponent";
import { type JSX } from "react";
import { useBundleProductComponents } from "./BundleProductProvider";

const ProductComponents = (): JSX.Element => {
  const components = useBundleProductComponents();

  return (
    <div className="flex flex-row flex-wrap">
      {Object.keys(components).map((key) => {
        return (
          <ProductComponent
            key={key}
            component={components[key]!}
            componentLookupKey={key}
          />
        );
      })}
    </div>
  );
};

export default ProductComponents;
