import { NextResponse } from "next/server";
import {
  createAuthenticationErrorUrl,
  createMissingEnvironmentVariableUrl,
} from "./create-missing-environment-variable-url";
import { tokenExpired } from "../token-expired";
import {
  AccessTokenResponse,
  createAnAccessToken,
} from "@epcc-sdk/sdks-shopper";
import { Middleware } from "./run-middleware";
import { COOKIE_PREFIX_KEY } from "../cookie-constants";

export const epccEndpoint = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;

export const implicitAuthMiddleware: Middleware = async (
  req,
  _event,
  context,
  next,
) => {
  if (typeof clientId !== "string") {
    return NextResponse.redirect(
      createMissingEnvironmentVariableUrl(
        ["NEXT_PUBLIC_EPCC_CLIENT_ID", "NEXT_PUBLIC_COOKIE_PREFIX_KEY"],
        req.nextUrl.basePath,
        req.url,
      ),
    );
  }

  const possibleImplicitCookie = req.cookies.get(
    `${COOKIE_PREFIX_KEY}_ep_credentials`,
  );

  const parsedToken =
    possibleImplicitCookie &&
    (JSON.parse(possibleImplicitCookie.value) as AccessTokenResponse);

  if (parsedToken && !tokenExpired(parsedToken.expires!)) {
    return next({
      ...context,
      token: parsedToken,
    });
  }

  const authResponse = await getTokenImplicitToken({
    grant_type: "implicit",
    client_id: clientId,
  });

  /**
   * Check response did not fail
   */
  if (!authResponse.data) {
    return NextResponse.redirect(
      createAuthenticationErrorUrl(
        `Implicit auth middleware failed to get access token.`,
        req.nextUrl.origin,
        req.url,
      ),
    );
  }

  const token = authResponse.data;

  const response = await next({
    ...context,
    token,
  });

  response.cookies.set(
    `${COOKIE_PREFIX_KEY}_ep_credentials`,
    JSON.stringify({
      ...token,
      client_id: clientId,
    }),
    {
      sameSite: "strict",
      expires: new Date(token.expires! * 1000),
    },
  );

  return response;
};

async function getTokenImplicitToken(body: {
  grant_type: "implicit";
  client_id: string;
}) {
  return createAnAccessToken({
    baseUrl: `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}`,
    body: {
      grant_type: "implicit",
      client_id: body.client_id,
    },
  });
}
