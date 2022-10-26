import { NextRequest, NextResponse } from "next/server";
import {
  createAuthenticationErrorUrl,
  createMissingEnvironmentVariableUrl,
} from "./create-missing-environment-variable-url";
import { epccEndpoint } from "./implicit-auth-middleware";
import { NextResponseFlowResult } from "./middleware-runner";
import { tokenExpired } from "../token-expired";

const cookiePrefixKey = process.env.NEXT_PUBLIC_COOKIE_PREFIX_KEY;

export async function cartCookieMiddleware(
  req: NextRequest,
  previousResponse: NextResponse
): Promise<NextResponseFlowResult> {
  if (typeof cookiePrefixKey !== "string") {
    return {
      shouldReturn: true,
      resultingResponse: NextResponse.redirect(
        createMissingEnvironmentVariableUrl(
          "NEXT_PUBLIC_COOKIE_PREFIX_KEY",
          req.nextUrl.basePath,
          req.url
        )
      ),
    };
  }

  if (req.cookies.get(`${cookiePrefixKey}_ep_cart`)) {
    return {
      shouldReturn: false,
      resultingResponse: previousResponse,
    };
  }

  if (typeof epccEndpoint !== "string") {
    return {
      shouldReturn: true,
      resultingResponse: NextResponse.redirect(
        createMissingEnvironmentVariableUrl(
          "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
          req.nextUrl.basePath,
          req.url
        )
      ),
    };
  }

  const authToken = retrieveAuthToken(req, previousResponse);

  if (!authToken) {
    return {
      shouldReturn: true,
      resultingResponse: NextResponse.redirect(
        createAuthenticationErrorUrl(
          `Cart cookie creation failed in middleware because credentials \"${cookiePrefixKey}_ep_credentials\" cookie was missing.`,
          req.nextUrl.origin,
          req.url
        )
      ),
    };
  }

  const createdCart = await fetch(`https://${epccEndpoint}/v2/carts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { name: "Cart" } }),
  });

  const parsedCartJSON = await createdCart.json();

  previousResponse.cookies.set(
    `${cookiePrefixKey}_ep_cart`,
    parsedCartJSON.data.id,
    {
      sameSite: "strict",
      expires: new Date(parsedCartJSON.data.meta.timestamps.expires_at),
    }
  );

  return {
    shouldReturn: false,
    resultingResponse: previousResponse,
  };
}

function retrieveAuthToken(
  req: NextRequest,
  resp: NextResponse
): { access_token: string; expires: number } | undefined {
  const authCookie =
    req.cookies.get(`${cookiePrefixKey}_ep_credentials`) ??
    resp.cookies.get(`${cookiePrefixKey}_ep_credentials`);

  const possiblyParsedCookie = authCookie && JSON.parse(authCookie);

  return possiblyParsedCookie && tokenExpired(possiblyParsedCookie.expires)
    ? undefined
    : possiblyParsedCookie;
}
