import {
  useBundleComponent,
  useBundle,
  useBundleComponentOption,
} from "@elasticpath/react-shopper-hooks";
import type { BundleComponent } from "@elasticpath/react-shopper-hooks";
import { ProductComponentOption, ProductResponse } from "@elasticpath/js-sdk";
import { sortByOrder } from "./sort-by-order";
import { useField, useFormikContext } from "formik";

import clsx from "clsx";
import Image from "next/image";
import * as React from "react";
import NoImage from "../../NoImage";

export const ProductComponent = ({
  component,
  componentLookupKey,
}: {
  component: BundleComponent;
  componentLookupKey: string;
}): JSX.Element => {
  const { componentProducts } = useBundle();

  const { name } = component;

  const { errors, touched } = useFormikContext<{
    selectedOptions: any;
  }>();

  return (
    <fieldset
      id={`selectedOptions.${componentLookupKey}`}
      className={clsx(
        ((errors as any)?.[`selectedOptions.${componentLookupKey}`] &&
          (touched as any)?.[`selectedOptions.${componentLookupKey}`]) ??
          "border-red-500",
        "w-full relative",
      )}
    >
      <div key={name} className="m-2">
        <legend className="mb-2">{name}</legend>
        <div>
          {(errors as any)[`selectedOptions.${componentLookupKey}`] && (
            <div className="">
              {(errors as any)[`selectedOptions.${componentLookupKey}`]}
            </div>
          )}
          <CheckboxComponentOptions
            componentProducts={componentProducts}
            componentLookupKey={componentLookupKey}
            options={component.options}
            max={component.max}
            min={component.min}
          />
        </div>
      </div>
    </fieldset>
  );
};

function CheckboxComponentOptions({
  options,
  componentLookupKey,
}: {
  componentProducts: ProductResponse[];
  options: ProductComponentOption[];
  max?: number | null;
  min?: number | null;
  componentLookupKey: string;
}): JSX.Element {
  return (
    <div className="flex py-2 flex-wrap gap-2" role="group">
      {options.sort(sortByOrder).map((option) => {
        return (
          <CheckboxComponentOption
            key={option.id}
            option={option}
            componentKey={componentLookupKey}
          />
        );
      })}
    </div>
  );
}

function CheckboxComponentOption({
  option,
  componentKey,
}: {
  option: ProductComponentOption;
  componentKey: string;
}): JSX.Element {
  const { selected, component } = useBundleComponent(componentKey);
  const { optionProduct, mainImage } = useBundleComponentOption(
    componentKey,
    option.id,
  );

  const selectedOptionKey = Object.keys(selected);

  const reachedMax =
    !!component.max && Object.keys(selected).length === component.max;

  const isDisabled =
    reachedMax &&
    !selectedOptionKey.some((optionKey) => optionKey === option.id);

  const name = `selectedOptions.${componentKey}`;
  const inputId = `${name}.${option.id}`;

  const [field] = useField({
    name,
    type: "checkbox",
    value: JSON.stringify({ [option.id]: option.quantity }),
    disabled: isDisabled,
    id: inputId,
  });

  return (
    <div className={clsx(isDisabled && "opacity-50", "w-28")} key={option.id}>
      <label
        htmlFor={inputId}
        className={clsx(
          "cursor-pointer",
          !field.checked && isDisabled ? "opacity-50" : "",
        )}
      >
        <input
          {...field}
          type="checkbox"
          id={inputId}
          disabled={isDisabled}
          className="hidden"
          hidden
        />
        <div
          className={clsx(
            field.checked ? "border-brand-primary" : "border-transparent",
            "relative border-2 aspect-square rounded-lg",
          )}
        >
          {mainImage?.link.href ? (
            <Image
              alt={mainImage?.id!}
              src={mainImage?.link?.href ?? "/150-placeholder.png"}
              className="rounded-lg"
              sizes="(max-width: 160px)"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          ) : (
            <NoImage />
          )}
        </div>
      </label>
      <p className="text-base">{optionProduct.attributes.name}</p>
      <p className="text-sm">
        {optionProduct.meta.display_price?.without_tax.formatted}
      </p>
    </div>
  );
}
