import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { implicitAuthMiddleware } from "./lib/middleware/implicit-auth-middleware";
import { cartCookieMiddleware } from "./lib/middleware/cart-cookie-middleware";
import { composeMiddleware } from "./lib/middleware/run-middleware";
import { SUPPORTED_LOCALES } from "./lib/i18n";

export const config = {
  matcher: ["/", "/((?!_next|api|favicon|configuration-error).*)"],
};

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const acceptLanguage = req.headers.get("accept-language");
  const firstLang = acceptLanguage?.split(",")[0] ?? "";
  const browserLocale = firstLang.split("-")[0] || "en";
  
  const DEFAULT_LOCALE = SUPPORTED_LOCALES.includes(browserLocale)
    ? browserLocale
    : "en";

  const url = req.nextUrl.clone();
  const pathSegments = url.pathname.split("/").filter(Boolean);

  const locale = pathSegments[0] ?? "";

  if (!SUPPORTED_LOCALES.includes(locale)) {
    url.pathname = `/${DEFAULT_LOCALE}${url.pathname}`;
    return NextResponse.redirect(url);
  }

  const runner = composeMiddleware([
    implicitAuthMiddleware,
    cartCookieMiddleware,
  ]);
  return runner(req, event);
}