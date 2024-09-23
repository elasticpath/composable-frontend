import { NextRequest, NextResponse } from "next/server";
import { NextResponseFlowResult } from "./middleware-runner";
import { formUrlEncodeBody } from "../form-url-encode-body";
import {
  createAuthenticationErrorUrl,
  createMissingEnvironmentVariableUrl,
} from "./create-missing-environment-variable-url";
import { tokenExpired } from "../token-expired";
import { applySetCookie } from "./apply-set-cookie";

export const epccEndpoint = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;
const cookiePrefixKey = process.env.NEXT_PUBLIC_COOKIE_PREFIX_KEY;

export async function implicitAuthMiddleware(
  req: NextRequest,
  previousResponse: NextResponse,
): Promise<NextResponseFlowResult> {
  if (typeof clientId !== "string" || typeof cookiePrefixKey !== "string") {
    return {
      shouldReturn: true,
      resultingResponse: NextResponse.redirect(
        createMissingEnvironmentVariableUrl(
          ["NEXT_PUBLIC_EPCC_CLIENT_ID", "NEXT_PUBLIC_COOKIE_PREFIX_KEY"],
          req.nextUrl.basePath,
          req.url,
        ),
      ),
    };
  }

  const possibleImplicitCookie = req.cookies.get(
    `${cookiePrefixKey}_ep_credentials`,
  );

  if (
    possibleImplicitCookie &&
    !tokenExpired(JSON.parse(possibleImplicitCookie.value).expires)
  ) {
    return {
      shouldReturn: false,
      resultingResponse: previousResponse,
    };
  }

  const authResponse = await getTokenImplicitToken({
    grant_type: "implicit",
    client_id: clientId,
  });

  const token = await authResponse.json();

  /**
   * Check response did not fail
   */
  if (token && "errors" in token) {
    return {
      shouldReturn: true,
      resultingResponse: NextResponse.redirect(
        createAuthenticationErrorUrl(
          `Implicit auth middleware failed to get access token.`,
          req.nextUrl.origin,
          req.url,
        ),
      ),
    };
  }

  previousResponse.cookies.set(
    `${cookiePrefixKey}_ep_credentials`,
    JSON.stringify({
      ...token,
      client_id: clientId,
    }),
    {
      sameSite: "strict",
      expires: new Date(token.expires * 1000),
    },
  );

  // Apply those cookies to the request
  // Workaround for - https://github.com/vercel/next.js/issues/49442#issuecomment-1679807704
  applySetCookie(req, previousResponse);

  return {
    shouldReturn: false,
    resultingResponse: previousResponse,
  };
}

async function getTokenImplicitToken(body: {
  grant_type: "implicit";
  client_id: string;
}): Promise<Response> {
  return fetch(`https://${epccEndpoint}/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formUrlEncodeBody(body),
  });
}
