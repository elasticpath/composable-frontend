"use client";

import {
  AnonymousCheckoutForm,
  SubscriptionCheckoutForm,
} from "../../../components/checkout/form-schema/checkout-form-schema";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form/Form";
import { Input } from "../../../components/input/Input";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "../../../components/Checkbox";

export function GuestInformation() {
  const pathname = usePathname();

  const { control, register } = useFormContext<
    SubscriptionCheckoutForm | AnonymousCheckoutForm
  >();

  const type = useWatch({ control, name: "type" });
  const isSubscription = type === "subscription";

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
      <input type="hidden" {...register("type")} value="guest" />
      <FormField
        control={control}
        name="guest.email"
        defaultValue=""
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
      <FormField
        control={control}
        name="guest.createAccount"
        render={({ field }) => (
          <FormItem className="flex items-center flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4">
            <FormControl>
              <Checkbox
                disabled={isSubscription}
                defaultValue={isSubscription ? "true" : undefined}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Create an account to manage your orders.</FormLabel>
              {isSubscription && (
                <FormDescription>
                  Required when a subscriptions is in your cart.
                </FormDescription>
              )}
            </div>
          </FormItem>
        )}
      />
    </fieldset>
  );
}
