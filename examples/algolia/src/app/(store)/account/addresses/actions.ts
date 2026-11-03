"use server";

import { z } from "zod";
import {
  AddressFormState,
  rejectAddressSubmission,
} from "./address-form-state";
import { cookies } from "next/headers";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { revalidatePath } from "next/cache";
import { shippingAddressSchema } from "../../../../components/checkout/form-schema/checkout-form-schema";
import { AccountAddress, Resource } from "@elasticpath/js-sdk";
import { redirect } from "next/navigation";

const deleteAddressSchema = z.object({
  addressId: z.string(),
});

const updateAddressSchema = shippingAddressSchema.merge(
  z.object({
    name: z.string(),
    addressId: z.string(),
    line_2: z
      .string()
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
  }),
);

const addAddressSchema = shippingAddressSchema.merge(
  z.object({
    name: z.string(),
    line_2: z
      .string()
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
  }),
);

export async function deleteAddress(formData: FormData) {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = deleteAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    throw new Error("Invalid address id");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const { addressId } = validatedFormData.data;
  const selectedAccount = getSelectedAccount(accountMemberCreds);

  try {
    // TODO fix the sdk typing for this endpoint
    //    should be able to include the token in the request
    await client.request.send(
      `/accounts/${selectedAccount.account_id}/addresses/${addressId}`,
      "DELETE",
      null,
      undefined,
      client,
      undefined,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );

    revalidatePath("/accounts/addresses");
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting address");
  }
}

export async function updateAddress(
  previousState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = updateAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    return rejectAddressSubmission(previousState, formData, {
      message: "Check the highlighted fields and try again.",
      fieldErrors: validatedFormData.error.flatten().fieldErrors,
    });
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCreds);

  const { addressId, ...addressData } = validatedFormData.data;

  const body = {
    data: {
      type: "address",
      id: addressId,
      ...addressData,
    },
  };

  try {
    // TODO fix the sdk typing for this endpoint
    //    should be able to include the token in the request
    await client.request.send(
      `/accounts/${selectedAccount.account_id}/addresses/${addressId}`,
      "PUT",
      body,
      undefined,
      client,
      false,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );

    revalidatePath("/accounts/addresses");
  } catch (error) {
    console.error(error);
    return rejectAddressSubmission(previousState, formData, {
      message: "We could not update this address. Please try again.",
    });
  }

  return { attempt: previousState.attempt };
}

export async function addAddress(
  previousState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = addAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    return rejectAddressSubmission(previousState, formData, {
      message: "Check the highlighted fields and try again.",
      fieldErrors: validatedFormData.error.flatten().fieldErrors,
    });
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCreds);

  const { ...addressData } = validatedFormData.data;

  const body = {
    data: {
      type: "address",
      ...addressData,
    },
  };

  let redirectUrl: string | undefined = undefined;
  try {
    // TODO fix the sdk typing for this endpoint
    //    should be able to include the token in the request
    const result = (await client.request.send(
      `/accounts/${selectedAccount.account_id}/addresses`,
      "POST",
      body,
      undefined,
      client,
      false,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    )) as Resource<AccountAddress>;

    redirectUrl = `/account/addresses/${result.data.id}`;
  } catch (error) {
    console.error(error);
    return rejectAddressSubmission(previousState, formData, {
      message: "We could not add this address. Please try again.",
    });
  }

  revalidatePath("/account/addresses");
  redirect(redirectUrl);
}
