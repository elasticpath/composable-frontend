"use client";
import {
  useAccountAddresses,
  useAuthedAccountMember,
} from "@elasticpath/react-shopper-hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/select/Select";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckoutForm as CheckoutFormSchemaType } from "../../../components/checkout/form-schema/checkout-form-schema";
import { AccountAddress } from "@elasticpath/js-sdk";
import { useEffect } from "react";
import { Skeleton } from "../../../components/skeleton/Skeleton";
import { Button } from "../../../components/button/Button";
import Link from "next/link";

export function ShippingSelector() {
  const { selectedAccountToken } = useAuthedAccountMember();

  const { data: accountAddressData } = useAccountAddresses(
    selectedAccountToken?.account_id!,
    {
      ep: { accountMemberToken: selectedAccountToken?.token },
      enabled: !!selectedAccountToken,
    },
  );

  const { setValue } = useFormContext<CheckoutFormSchemaType>();

  function updateAddress(addressId: string, addresses: AccountAddress[]) {
    const address = addresses.find((address) => address.id === addressId);

    if (address) {
      setValue("shippingAddress", {
        postcode: address.postcode,
        line_1: address.line_1,
        line_2: address.line_2,
        city: address.city,
        county: address.county,
        country: address.country,
        company_name: address.company_name,
        first_name: address.first_name,
        last_name: address.last_name,
        phone_number: address.phone_number,
        instructions: address.instructions,
        region: address.region,
      });
    }
  }

  useEffect(() => {
    if (accountAddressData && accountAddressData[0]) {
      updateAddress(accountAddressData[0].id, accountAddressData);
    }
  }, [accountAddressData]);

  return (
    <div>
      {accountAddressData ? (
        <Select
          onValueChange={(value) =>
            updateAddress(value, accountAddressData ?? [])
          }
          defaultValue={accountAddressData[0]?.id}
        >
          <SelectTrigger className="p-5">
            <SelectValue placeholder="Select address" />
          </SelectTrigger>
          <SelectContent>
            {accountAddressData?.map((address) => (
              <SelectItem key={address.id} value={address.id} className="py-5">
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
              <Link href="/account/addresses">Add new...</Link>
            </Button>
          </SelectContent>
        </Select>
      ) : (
        <Skeleton className="w-full h-20" />
      )}
    </div>
  );
}
