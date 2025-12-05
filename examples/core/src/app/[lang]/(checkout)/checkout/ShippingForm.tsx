"use client";

import { CheckoutForm as CheckoutFormSchemaType } from "src/components/checkout/form-schema/checkout-form-schema";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/form/Form";
import { Input } from "src/components/input/Input";
import React from "react";
import { CountryCombobox } from "src/components/combobox/CountryCombobox";

export function ShippingForm() {
  const form = useFormContext<CheckoutFormSchemaType>();
  return (
    <fieldset className="flex flex-1 flex-col gap-5">
      <div>
        <legend className="text-2xl font-medium">Shipping address</legend>
      </div>
      <div className="grid gap-4">
        <CountryCombobox
          form={form}
          control={form.control}
          name={"shippingAddress.country"}
        />
        <div className="grid grid-cols-[1fr] gap-4 lg:grid-cols-[1fr_1fr]">
          <FormField
            control={form.control}
            defaultValue=""
            name="shippingAddress.first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="shipping given-name"
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
            control={form.control}
            name="shippingAddress.last_name"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="shipping family-name"
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
          control={form.control}
          name="shippingAddress.company_name"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="shipping company"
                  aria-label="Company"
                  sizeKind="mediumUntilSm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shippingAddress.line_1"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="shipping address-line-1"
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
            control={form.control}
            name="shippingAddress.city"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="shipping city"
                    aria-label="City"
                    sizeKind="mediumUntilSm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingAddress.region"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="shipping region"
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
            control={form.control}
            name="shippingAddress.postcode"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="shipping postcode"
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
        <FormField
          control={form.control}
          name="shippingAddress.phone_number"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="tel"
                  aria-label="Phone Number"
                  sizeKind="mediumUntilSm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </fieldset>
  );
}
