"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { shippingAddressSchema } from "../../../../components/checkout/form-schema/checkout-form-schema";
import { redirect } from "next/navigation";
import { createElasticPathClient } from "../../../../lib/create-elastic-path-client";
import {
  deleteV2AccountAddress,
  postV2AccountAddress,
  putV2AccountAddress,
} from "@epcc-sdk/sdks-shopper";

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
  const client = await createElasticPathClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = deleteAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    throw new Error("Invalid address id");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const { addressId } = validatedFormData.data;
  const selectedAccount = getSelectedAccount(accountMemberCreds);

  try {
    await deleteV2AccountAddress({
      client,
      path: {
        accountID: selectedAccount.account_id,
        addressID: addressId,
      },
    });

    revalidatePath("/accounts/addresses");
    revalidateTag("account-addresses");
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting address");
  }
}

export async function updateAddress(formData: FormData) {
  const client = await createElasticPathClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = updateAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    console.error(JSON.stringify(validatedFormData.error));
    throw new Error("Invalid address submission");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCreds);

  const { addressId, ...addressData } = validatedFormData.data;

  try {
    await putV2AccountAddress({
      client,
      path: {
        accountID: selectedAccount.account_id,
        addressID: addressId,
      },
      body: {
        data: {
          type: "address",
          ...addressData,
        },
      },
    });

    revalidatePath("/accounts/addresses");
    revalidateTag("account-addresses");
  } catch (error) {
    console.error(error);
    throw new Error("Error updating address");
  }
}

export async function addAddress(formData: FormData) {
  const client = await createElasticPathClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = addAddressSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    console.error(JSON.stringify(validatedFormData.error));
    throw new Error("Invalid address submission");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const selectedAccount = getSelectedAccount(accountMemberCreds);

  const { ...addressData } = validatedFormData.data;

  let redirectUrl: string | undefined = undefined;
  try {
    const result = await postV2AccountAddress({
      client,
      path: {
        accountID: selectedAccount.account_id,
      },
      body: {
        data: {
          type: "address",
          ...addressData,
        },
      },
    });

    if (result.error) {
      console.error(JSON.stringify(result.error));
      throw new Error("Failed to create address");
    }

    redirectUrl = `/account/addresses/${result.data?.data?.id}`;
  } catch (error) {
    console.error(error);
    throw new Error("Error adding address");
  }

  revalidatePath("/account/addresses");
  revalidateTag("account-addresses");

  redirect(redirectUrl);
}
