"use client";

import { CheckoutForm as CheckoutFormSchemaType } from "../../../components/checkout/form-schema/checkout-form-schema";
import { Checkbox } from "../../../components/Checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form/Form";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/select/Select";
import { Input } from "../../../components/input/Input";
import React, { useEffect } from "react";
import { useCountries } from "../../../hooks/use-countries";

export function BillingForm() {
  const { control, resetField } = useFormContext<CheckoutFormSchemaType>();
  const { data: countries } = useCountries();
  const isSameAsShipping = useWatch({ control, name: "sameAsShipping" });

  useEffect(() => {
    // Reset the billing address fields when the user selects the same as shipping address
    if (isSameAsShipping) {
      resetField("billingAddress", {
        keepDirty: false,
        keepTouched: false,
        keepError: false,
      });
    }
  }, [isSameAsShipping, resetField]);

  return (
    <fieldset className="flex flex-col gap-5">
      <div>
        <legend className="text-2xl font-medium">Billing address</legend>
      </div>
      <div className="flex items-center">
        <FormField
          control={control}
          name="sameAsShipping"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Same as shipping address</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
      {!isSameAsShipping && (
        <div className="grid gap-4">
          <FormField
            control={control}
            name="billingAddress.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  required
                  autoComplete="billing country"
                  aria-label="Country"
                >
                  <SelectTrigger sizeKind="mediumUntilSm">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {countries?.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-[1fr_1fr]">
            <FormField
              control={control}
              name="billingAddress.first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="billing given-name"
                      aria-label="First Name"
                      sizeKind="mediumUntilSm"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="billingAddress.last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="billing family-name"
                      aria-label="Last Name"
                      sizeKind="mediumUntilSm"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="billingAddress.company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="billing company"
                    aria-label="Company"
                    sizeKind="mediumUntilSm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="billingAddress.line_1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="billing address-line-1"
                    aria-label="Address"
                    sizeKind="mediumUntilSm"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-3">
            <FormField
              control={control}
              name="billingAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="billing city"
                      aria-label="City"
                      sizeKind="mediumUntilSm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="billingAddress.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="billing region"
                      aria-label="Region"
                      sizeKind="mediumUntilSm"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="billingAddress.postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="billing postcode"
                      aria-label="Postcode"
                      sizeKind="mediumUntilSm"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
