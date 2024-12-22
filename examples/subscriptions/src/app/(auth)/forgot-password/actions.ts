"use server";

import { z } from "zod";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { getErrorMessage } from "../../../lib/get-error-message";
import { OneTimePasswordTokenRequestBody } from "@elasticpath/js-sdk";

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;
const AUTHENTICATION_REALM_ID = process.env.NEXT_PUBLIC_AUTHENTICATION_REALM_ID!;

export async function requestPasswordReset(formData: FormData) {
  const client = getServerSideImplicitClient();

  const rawEntries = Object.fromEntries(formData.entries());
  const validatedProps = requestPasswordResetSchema.safeParse(rawEntries);

  if (!validatedProps.success) {
    return {
      error: "Please enter a valid email address",
    };
  }

  const { email } = validatedProps.data;
  const body: OneTimePasswordTokenRequestBody = {
    type: "one_time_password_token_request",
    username: email.toLowerCase(),
    purpose: "reset_password",
  }
  try {
    await client.OneTimePasswordTokenRequest.Create(
      AUTHENTICATION_REALM_ID,
      PASSWORD_PROFILE_ID,
      body,
      undefined
    );
    
    return {
      success: true,
    };
  } catch (error) {
    console.error(getErrorMessage(error));
    return {
      error: "Failed to send reset instructions. Please try again.",
    };
  }
} 