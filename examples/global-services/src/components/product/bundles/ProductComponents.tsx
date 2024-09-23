import { useBundle } from "@elasticpath/react-shopper-hooks";
import { ProductComponent } from "./ProductComponent";
import { useFormikContext } from "formik";
import { useEffect } from "react";
import { FormSelectedOptions, formSelectedOptionsToData } from "./form-parsers";

const ProductComponents = (): JSX.Element => {
  const { components, updateSelectedOptions } = useBundle();

  const { values } = useFormikContext<{
    selectedOptions: FormSelectedOptions;
  }>();

  useEffect(() => {
    updateSelectedOptions(formSelectedOptionsToData(values.selectedOptions));
  }, [values, updateSelectedOptions]);

  return (
    <div className="flex flex-row flex-wrap">
      {Object.keys(components).map((key) => {
        return (
          <ProductComponent
            key={key}
            component={components[key]}
            componentLookupKey={key}
          />
        );
      })}
    </div>
  );
};

export default ProductComponents;
