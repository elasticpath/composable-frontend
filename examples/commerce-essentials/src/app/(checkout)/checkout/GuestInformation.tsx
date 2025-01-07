"use client";

import { CheckoutForm as CheckoutFormSchemaType } from "../../../components/checkout/form-schema/checkout-form-schema";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form/Form";
import { Input } from "../../../components/input/Input";
import React from "react";
import { useFormContext } from "react-hook-form";

export function GuestInformation() {
  const pathname = usePathname();

  const { control } = useFormContext<CheckoutFormSchemaType>();

  return (
    <fieldset className="flex flex-1 flex-col gap-6 self-stretch">
      <div className="flex justify-between self-stretch items-baseline">
        <legend className="text-2xl font-medium">Your Info</legend>
        <span className="text-black/60">
          Already a customer?{" "}
          <Link
            href={`/login?returnUrl=${pathname}`}
            className="underline text-black"
          >
            Sign in
          </Link>
        </span>
      </div>
      <FormField
        control={control}
        name="guest.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoComplete="email"
                aria-label="Email Address"
                sizeKind="mediumUntilSm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
