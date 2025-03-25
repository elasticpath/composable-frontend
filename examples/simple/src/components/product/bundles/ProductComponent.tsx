import { sortByOrder } from "./sort-by-order";

import clsx from "clsx";
import Image from "next/image";
import * as React from "react";
import NoImage from "../../NoImage";

import type { JSX } from "react";
import {
  BundleConfiguration,
  ComponentProduct,
  ComponentProductOption,
} from "@epcc-sdk/sdks-shopper/dist/client/types.gen";
import { useBundleComponentProducts } from "./BundleProductProvider";
import { Product } from "@epcc-sdk/sdks-shopper";
import { useBundleComponent } from "./useBundleComponent";
import { useBundleComponentOption } from "./useBundleComponentOption";
import { useFormContext } from "react-hook-form";
import { FormSelectedOptions } from "./form-parsers";
import { FormControl, FormField, FormItem, FormMessage } from "../../form/Form";
import { Checkbox } from "../../Checkbox";
import { checkOption, isChecked, uncheckOption } from "./checked-utils";

export const ProductComponent = ({
  component,
  componentLookupKey,
}: {
  component: ComponentProduct;
  componentLookupKey: string;
}): JSX.Element => {
  const componentProducts = useBundleComponentProducts();

  const { name } = component;

  const form = useFormContext<{
    selectedOptions: BundleConfiguration["selected_options"];
  }>();

  return (
    <FormField
      control={form.control}
      name={`selectedOptions.${componentLookupKey}`}
      render={(field) => (
        <FormItem>
          <fieldset
            id={`selectedOptions.${componentLookupKey}`}
            className={clsx(
              field.fieldState.invalid &&
                field.fieldState.isTouched &&
                "border-red-500",
              "w-full relative",
            )}
          >
            <div key={name} className="m-2">
              <legend className="mb-2">{name}</legend>
              <div>
                <FormMessage />
                <CheckboxComponentOptions
                  componentProducts={componentProducts}
                  componentLookupKey={componentLookupKey}
                  options={component.options ?? []}
                  max={component.max}
                  min={component.min}
                />
              </div>
            </div>
          </fieldset>
        </FormItem>
      )}
    />
  );
};

function CheckboxComponentOptions({
  options,
  componentLookupKey,
}: {
  componentProducts: Product[];
  options: ComponentProductOption[];
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
  option: ComponentProductOption;
  componentKey: string;
}): JSX.Element {
  const { selected, component } = useBundleComponent(componentKey);
  const { optionProduct, mainImage } = useBundleComponentOption(
    componentKey,
    option.id!,
  );

  const reachedMax = !!component.max && selected.length === component.max;

  const isDisabled = reachedMax && !isChecked(selected, option.id!);

  const name = `selectedOptions.${componentKey}`;
  const inputId = `${name}.${option.id}`;

  const form = useFormContext<{
    selectedOptions: FormSelectedOptions;
  }>();

  return (
    <div className={clsx(isDisabled && "opacity-50", "w-28")} key={option.id}>
      <FormField
        control={form.control}
        name={`selectedOptions.${componentKey}`}
        render={({ field }) => {
          const checked = isChecked(field.value, option.id!);
          return (
            <FormItem
              key={`selectedOptions.${componentKey}`}
              className="flex flex-row items-start space-x-3 space-y-0"
            >
              <label
                htmlFor={inputId}
                className={clsx(
                  "cursor-pointer",
                  !checked && isDisabled ? "opacity-50" : "",
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange(
                            checkOption(
                              field.value,
                              option.id!,
                              option.quantity!,
                            ),
                          )
                        : field.onChange(
                            uncheckOption(field.value, option.id!),
                          );
                    }}
                    id={inputId}
                    disabled={isDisabled}
                    className="hidden"
                    hidden
                  />
                </FormControl>
                <div
                  className={clsx(
                    checked ? "border-brand-primary" : "border-transparent",
                    "relative border-2 aspect-square rounded-lg",
                  )}
                >
                  {mainImage?.link?.href ? (
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
            </FormItem>
          );
        }}
      />
      <p className="text-base">{optionProduct.attributes?.name}</p>
      <p className="text-sm">
        {optionProduct.meta?.display_price?.without_tax?.formatted}
      </p>
    </div>
  );
}
