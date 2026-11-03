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
import { useFormState } from "react-dom";
import { AddressFieldError, AddressFormError } from "../address-form-errors";
import {
  AddressFormState,
  initialAddressFormState,
  isAddressSubmissionRejected,
} from "../address-form-state";
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
  const [state, formAction] = useFormState(
    async (previousState: AddressFormState, formData: FormData) => {
      const nextState = await updateAddress(previousState, formData);
      if (!isAddressSubmissionRejected(nextState)) {
        await queryClient.invalidateQueries({
          queryKey: [
            ...accountAddressesQueryKeys.list({
              accountId: selectedAccountToken?.account_id,
            }),
          ],
        });
      }
      return nextState;
    },
    initialAddressFormState,
  );

  return (
    <form
      key={state.attempt}
      action={formAction}
      className="flex flex-col gap-5"
    >
      <AddressFormError message={state.message} />
      <fieldset className="flex flex-col gap-5">
        <input type="hidden" value={addressId} name="addressId" readOnly />
        <div className="flex flex-col self-stretch">
          <p>
            <Label htmlFor="address_name">Address Name</Label>
            <Input
              id="address_name"
              type="text"
              name="name"
              aria-label="Address Name"
              required
              defaultValue={state.values?.name ?? addressData.name}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby="address_name_error"
            />
            <AddressFieldError
              id="address_name_error"
              errors={state.fieldErrors?.name}
            />
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-6">
          <p className="sm:col-span-3">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              type="text"
              name="first_name"
              autoComplete="shipping given-name"
              aria-label="First Name"
              required
              defaultValue={state.values?.first_name ?? addressData.first_name}
              aria-invalid={Boolean(state.fieldErrors?.first_name)}
              aria-describedby="first_name_error"
            />
            <AddressFieldError
              id="first_name_error"
              errors={state.fieldErrors?.first_name}
            />
          </p>
          <p className="sm:col-span-3">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              name="last_name"
              autoComplete="shipping family-name"
              aria-label="Last Name"
              required
              defaultValue={state.values?.last_name ?? addressData.last_name}
              aria-invalid={Boolean(state.fieldErrors?.last_name)}
              aria-describedby="last_name_error"
            />
            <AddressFieldError
              id="last_name_error"
              errors={state.fieldErrors?.last_name}
            />
          </p>
          <div className="col-span-full">
            <Label htmlFor="line_1">Street Address</Label>
            <Input
              id="line_1"
              type="text"
              name="line_1"
              autoComplete="shipping address-line-1"
              aria-label="Street Address"
              defaultValue={state.values?.line_1 ?? addressData.line_1}
              aria-invalid={Boolean(state.fieldErrors?.line_1)}
              aria-describedby="line_1_error"
            />
            <AddressFieldError
              id="line_1_error"
              errors={state.fieldErrors?.line_1}
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="line_2">Extended Address</Label>
            <Input
              id="line_2"
              type="text"
              name="line_2"
              autoComplete="shipping address-line-2"
              aria-label="Extended Address"
              defaultValue={state.values?.line_2 ?? addressData.line_2}
              aria-invalid={Boolean(state.fieldErrors?.line_2)}
              aria-describedby="line_2_error"
            />
            <AddressFieldError
              id="line_2_error"
              errors={state.fieldErrors?.line_2}
            />
          </div>
          <div className="sm:col-span-2 sm:col-start-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              name="city"
              autoComplete="shipping city"
              aria-label="City"
              defaultValue={state.values?.city ?? addressData.city}
              aria-invalid={Boolean(state.fieldErrors?.city)}
              aria-describedby="city_error"
            />
            <AddressFieldError
              id="city_error"
              errors={state.fieldErrors?.city}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              type="text"
              name="county"
              autoComplete="shipping county"
              aria-label="County"
              defaultValue={state.values?.county ?? addressData.county}
              aria-invalid={Boolean(state.fieldErrors?.county)}
              aria-describedby="county_error"
            />
            <AddressFieldError
              id="county_error"
              errors={state.fieldErrors?.county}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              type="text"
              name="region"
              autoComplete="shipping region"
              aria-label="Region"
              defaultValue={state.values?.region ?? addressData.region}
              aria-invalid={Boolean(state.fieldErrors?.region)}
              aria-describedby="region_error"
            />
            <AddressFieldError
              id="region_error"
              errors={state.fieldErrors?.region}
            />
          </div>

          <div className="sm:col-span-2 sm:col-start-1">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              type="text"
              name="postcode"
              autoComplete="shipping postcode"
              aria-label="Postcode"
              required
              defaultValue={state.values?.postcode ?? addressData.postcode}
              aria-invalid={Boolean(state.fieldErrors?.postcode)}
              aria-describedby="postcode_error"
            />
            <AddressFieldError
              id="postcode_error"
              errors={state.fieldErrors?.postcode}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="country">Country</Label>
            <Select
              name="country"
              defaultValue={state.values?.country ?? addressData.country}
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
            <AddressFieldError
              id="country_error"
              errors={state.fieldErrors?.country}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="text"
              name="phone_number"
              autoComplete="tel"
              aria-label="Phone Number"
              defaultValue={
                state.values?.phone_number ?? addressData.phone_number
              }
              aria-invalid={Boolean(state.fieldErrors?.phone_number)}
              aria-describedby="phone_number_error"
            />
            <AddressFieldError
              id="phone_number_error"
              errors={state.fieldErrors?.phone_number}
            />
          </div>
          <div className="col-span-full">
            <Label htmlFor="instructions">Additional Instructions</Label>
            <Input
              id="instructions"
              autoComplete="shippingAddress instructions"
              type="text"
              name="instructions"
              aria-label="Additional Instructions"
              defaultValue={
                state.values?.instructions ?? addressData.instructions
              }
              aria-invalid={Boolean(state.fieldErrors?.instructions)}
              aria-describedby="instructions_error"
            />
            <AddressFieldError
              id="instructions_error"
              errors={state.fieldErrors?.instructions}
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
