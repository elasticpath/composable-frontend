"use server";

import { z } from "zod";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { redirect } from "next/navigation";
import { getErrorMessage } from "../../../lib/get-error-message";
import { AccountManagementAuthenticationTokenBody } from "@elasticpath/js-sdk";

const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password_profile_id: z.string(),
  user_authentication_info_id: z.string(),
  user_authentication_password_profile_info_id: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AUTHENTICATION_REALM_ID = process.env.NEXT_PUBLIC_AUTHENTICATION_REALM_ID!;
const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!;
export async function resetPassword(formData: FormData) {
  const client = getServerSideImplicitClient();
  
  const rawEntries = Object.fromEntries(formData.entries());
  const validatedProps = resetPasswordSchema.safeParse(rawEntries);

  if (!validatedProps.success) {
    return {
      error: validatedProps.error.errors[0].message,
    };
  }

  const { token, email, password_profile_id, newPassword, user_authentication_info_id, user_authentication_password_profile_info_id } = validatedProps.data;


  try {
    // First get the authentication token using the one-time password token
    const body: AccountManagementAuthenticationTokenBody = {
      type: "account_management_authentication_token",
      authentication_mechanism: "passwordless",
      password_profile_id: password_profile_id,
      username: email,
      one_time_password_token: token,
    };
    const accMgmtTokenResponse = await client.AccountMembers.GenerateAccountToken(body);

    const bodyUpdate: any = {  //UserAuthenticationPasswordProfileUpdateBody
      type: "user_authentication_password_profile_info",
      id: user_authentication_password_profile_info_id,
      // password_profile_id: password_profile_id,
      username: email,
      password: newPassword
    }
    // Now update the password
    await client.UserAuthenticationPasswordProfile.Update(
      AUTHENTICATION_REALM_ID,
      user_authentication_info_id,
      user_authentication_password_profile_info_id,
      {
        data: bodyUpdate
      }, 
      accMgmtTokenResponse.data[0].token,
      undefined
    );

    redirect("/login?message=Password+reset+successful");
  } catch (error) {
    console.log("error", error);
    console.error(getErrorMessage(error));
    redirect("/login?message=Failed+to+reset+password.+Please+try+again.");
  }
} 
