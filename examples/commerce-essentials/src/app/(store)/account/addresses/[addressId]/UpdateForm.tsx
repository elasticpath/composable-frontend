"use client";

import { updateAddress } from "../actions";
import { Label } from "../../../../../components/label/Label";
import { Input } from "../../../../../components/input/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/select/Select";
import { FormStatusButton } from "../../../../../components/button/FormStatusButton";
import React from "react";
import { countries as staticCountries } from "../../../../../lib/all-countries";
import { AccountAddress } from "@elasticpath/js-sdk";
import {
  accountAddressesQueryKeys,
  useAuthedAccountMember,
} from "@elasticpath/react-shopper-hooks";
import { useQueryClient } from "@tanstack/react-query";

export function UpdateForm({
  addressId,
  addressData,
}: {
  addressId: string;
  addressData: AccountAddress;
}) {
  const queryClient = useQueryClient();
  const { selectedAccountToken } = useAuthedAccountMember();
  const countries = staticCountries;

  return (
    <form
      action={async (formData) => {
        await updateAddress(formData);
        await queryClient.invalidateQueries({
          queryKey: [
            ...accountAddressesQueryKeys.list({
              accountId: selectedAccountToken?.account_id,
            }),
          ],
        });
      }}
      className="flex flex-col gap-5"
    >
      <fieldset className="flex flex-col gap-5">
        <input type="hidden" value={addressId} name="addressId" readOnly />
        <div className="flex flex-col self-stretch">
          <p>
            <Label htmlFor="address_name">Address Name</Label>
            <Input
              id="address_name"
              type="text"
              defaultValue={addressData.name}
              name="name"
              aria-label="Address Name"
              required
            />
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-6">
          <p className="sm:col-span-3">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              type="text"
              defaultValue={addressData.first_name}
              name="first_name"
              autoComplete="shipping given-name"
              aria-label="First Name"
              required
            />
          </p>
          <p className="sm:col-span-3">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              defaultValue={addressData.last_name}
              name="last_name"
              autoComplete="shipping family-name"
              aria-label="Last Name"
              required
            />
          </p>
          <div className="col-span-full">
            <Label htmlFor="line_1">Street Address</Label>
            <Input
              id="line_1"
              defaultValue={addressData.line_1}
              type="text"
              name="line_1"
              autoComplete="shipping address-line-1"
              aria-label="Street Address"
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="line_2">Extended Address</Label>
            <Input
              id="line_2"
              defaultValue={addressData.line_2}
              type="text"
              name="line_2"
              autoComplete="shipping address-line-2"
              aria-label="Extended Address"
            />
          </div>
          <div className="sm:col-span-2 sm:col-start-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              defaultValue={addressData.city}
              type="text"
              name="city"
              autoComplete="shipping city"
              aria-label="City"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              type="text"
              defaultValue={addressData.county}
              name="county"
              autoComplete="shipping county"
              aria-label="County"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              type="text"
              defaultValue={addressData.region}
              name="region"
              autoComplete="shipping region"
              aria-label="Region"
            />
          </div>

          <div className="sm:col-span-2 sm:col-start-1">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              type="text"
              defaultValue={addressData.postcode}
              name="postcode"
              autoComplete="shipping postcode"
              aria-label="Postcode"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="country">Country</Label>
            <Select
              name="country"
              defaultValue={addressData.country}
              autoComplete="shipping country"
              aria-label="Country"
              required
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
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="text"
              defaultValue={addressData.phone_number}
              name="phone_number"
              autoComplete="tel"
              aria-label="Phone Number"
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="instructions">Additional Instructions</Label>
            <Input
              id="instructions"
              defaultValue={addressData.instructions}
              autoComplete="shippingAddress instructions"
              type="text"
              name="instructions"
              aria-label="Additional Instructions"
            />
          </div>
        </div>
      </fieldset>
      <div className="flex">
        <FormStatusButton variant="secondary" type="submit">
          Save changes
        </FormStatusButton>
      </div>
    </form>
  );
}
