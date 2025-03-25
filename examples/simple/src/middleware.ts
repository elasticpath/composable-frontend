import { NextFetchEvent, NextRequest } from "next/server";
import { implicitAuthMiddleware } from "./lib/middleware/implicit-auth-middleware";
import { cartCookieMiddleware } from "./lib/middleware/cart-cookie-middleware";
import { composeMiddleware } from "./lib/middleware/run-middleware";

export const config = {
  matcher: ["/", "/((?!_next|api|favicon|configuration-error).*)"],
};

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const runner = composeMiddleware([
    implicitAuthMiddleware,
    cartCookieMiddleware,
  ]);
  return runner(req, event);
}
