"use client";

import {
  ControllerProps,
  FieldPath,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form/Form";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/Popover";
import { cn } from "../../lib/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command/Command";
import { countries } from "../../lib/all-countries";
import { CheckoutForm } from "../checkout/form-schema/checkout-form-schema";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";
import { inputVariants } from "../input/Input";

export function CountryCombobox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  form: UseFormReturn<CheckoutForm>;
}) {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Country</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <button
                  role="combobox"
                  className={cn(
                    // "flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
                    "flex items-center justify-between hover:cursor-pointer",
                    inputVariants({ sizeKind: "default" }),
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value
                    ? countries.find((country) => country.code === field.value)
                        ?.name
                    : "Select Country"}
                  <ChevronUpDownIcon className="size-5 opacity-50" />
                </button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              style={{ width: "var(--radix-popover-trigger-width)" }}
            >
              <Command>
                <CommandInput placeholder="Search framework..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        keywords={[country.name, country.code]}
                        value={country.code}
                        key={country.code}
                        onSelect={() => {
                          form.setValue(props.name as any, country.code);
                        }}
                      >
                        {country.name}
                        <CheckIcon
                          className={cn(
                            "ml-auto",
                            country.code === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
