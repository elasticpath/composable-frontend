"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/select/Select";
import { useFormContext } from "react-hook-form";
import { CheckoutForm as CheckoutFormSchemaType } from "src/components/checkout/form-schema/checkout-form-schema";
import { useEffect } from "react";
import { Skeleton } from "src/components/skeleton/Skeleton";
import { Button } from "src/components/button/Button";
import { LocaleLink } from "src/components/LocaleLink";
import { AccountAddressResponse } from "@epcc-sdk/sdks-shopper";

export function ShippingSelector({
  accountAddresses,
}: {
  accountAddresses: AccountAddressResponse[];
}) {
  const { setValue } = useFormContext<CheckoutFormSchemaType>();

  function updateAddress(
    addressId: string,
    addresses: AccountAddressResponse[],
  ) {
    const address = addresses.find((address) => address.id === addressId);

    if (address) {
      setValue("shippingAddress", {
        postcode: address.postcode!,
        line_1: address.line_1!,
        line_2: address.line_2,
        city: address.city,
        county: address.county,
        country: address.country!,
        company_name: address.company_name,
        first_name: address.first_name!,
        last_name: address.last_name!,
        phone_number: address.phone_number,
        instructions: address.instructions,
        region: address.region,
      });
    }
  }

  useEffect(() => {
    if (accountAddresses && accountAddresses[0]) {
      updateAddress(accountAddresses[0].id!, accountAddresses);
    }
  }, [accountAddresses]);

  return (
    <div>
      {accountAddresses ? (
        <Select
          onValueChange={(value) =>
            updateAddress(value, accountAddresses ?? [])
          }
          defaultValue={accountAddresses[0]?.id}
        >
          <SelectTrigger className="p-5">
            <SelectValue placeholder="Select address" />
          </SelectTrigger>
          <SelectContent>
            {accountAddresses?.map((address) => (
              <SelectItem key={address.id} value={address.id!} className="py-5">
                <div className="flex flex-col items-start gap-2">
                  <span>{address.name}</span>
                  <span className="text-sm text-black/60">
                    {`${address.line_1}, ${address.city}, ${address.postcode}`}
                  </span>
                </div>
              </SelectItem>
            ))}
            <Button
              variant="link"
              asChild
              className="text-base font-normal"
              type="button"
            >
              <LocaleLink href="/account/addresses">Add new...</LocaleLink>
            </Button>
          </SelectContent>
        </Select>
      ) : (
        <Skeleton className="w-full h-20" />
      )}
    </div>
  );
}
