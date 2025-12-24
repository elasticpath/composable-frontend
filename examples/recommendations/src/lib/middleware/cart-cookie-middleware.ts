import { NextResponse } from "next/server";
import {
  createAuthenticationErrorUrl,
  createMissingEnvironmentVariableUrl,
} from "./create-missing-environment-variable-url";
import { epccEndpoint } from "./implicit-auth-middleware";
import { Middleware } from "./run-middleware";
import { createACart } from "@epcc-sdk/sdks-shopper";
import { COOKIE_PREFIX_KEY } from "../cookie-constants";

export const cartCookieMiddleware: Middleware = async (
  req,
  _event,
  context,
  next,
) => {
  if (req.cookies.get(`${COOKIE_PREFIX_KEY}_ep_cart`)) {
    return next(context);
  }

  if (typeof epccEndpoint !== "string") {
    return NextResponse.redirect(
      createMissingEnvironmentVariableUrl(
        "NEXT_PUBLIC_EPCC_ENDPOINT_URL",
        req.nextUrl.basePath,
        req.url,
      ),
    );
  }

  const token = context.token;

  if (!token) {
    return NextResponse.redirect(
      createAuthenticationErrorUrl(
        `Cart cookie creation failed in middleware because credentials \"${COOKIE_PREFIX_KEY}_ep_credentials\" cookie was missing.`,
        req.nextUrl.origin,
        req.url,
      ),
    );
  }

  if (!token.access_token) {
    return NextResponse.redirect(
      createAuthenticationErrorUrl(
        `Cart cookie creation failed in middleware because credentials \"access_token\" was undefined.`,
        req.nextUrl.origin,
        req.url,
      ),
    );
  }

  const createdCart = await createACart({
    baseUrl: `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}`,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
    body: {
      data: {
        name: "Cart",
      },
    },
  });

  const response = await next(context);

  response.cookies.set(
    `${COOKIE_PREFIX_KEY}_ep_cart`,
    createdCart.data?.data?.id!,
    {
      sameSite: "strict",
      expires: new Date(
        (createdCart.data?.data?.meta?.timestamps as any)?.expires_at,
      ),
    },
  );

  return response;
};
