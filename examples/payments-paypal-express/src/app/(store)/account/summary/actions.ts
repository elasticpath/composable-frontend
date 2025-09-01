"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { retrieveAccountMemberCredentials } from "../../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "../../../../lib/get-error-message";
import { createElasticPathClient } from "../../../../lib/create-elastic-path-client";
import { putV2AccountsAccountId } from "@epcc-sdk/sdks-shopper";

const updateAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export async function updateAccount(formData: FormData) {
  const client = createElasticPathClient();

  const rawEntries = Object.fromEntries(formData.entries());

  const validatedFormData = updateAccountSchema.safeParse(rawEntries);

  if (!validatedFormData.success) {
    console.error(JSON.stringify(validatedFormData.error));
    throw new Error("Invalid account submission");
  }

  const accountMemberCreds = retrieveAccountMemberCredentials(
    await cookies(),
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCreds) {
    throw new Error("Account member credentials not found");
  }

  const { name, id } = validatedFormData.data;

  try {
    const result = await putV2AccountsAccountId({
      client,
      path: {
        accountID: id,
      },
      body: {
        data: {
          type: "account",
          name,
          legal_name: name,
        },
      },
    });

    revalidatePath("/accounts/summary");
    revalidateTag("account");
  } catch (error) {
    console.error(getErrorMessage(error));
    return {
      error: getErrorMessage(error),
    };
  }

  return;
}
