import { getCookie } from "cookies-next/client";
import { COOKIE_PREFIX_KEY } from "./cookie-constants";

export const EP_CURRENCY_CODE = retrieveCurrency();

function retrieveCurrency(): string {
  const currencyInCookie = getCookie(`${COOKIE_PREFIX_KEY}_ep_currency`);
  return (
    (typeof currencyInCookie === "string"
      ? currencyInCookie
      : process.env.NEXT_PUBLIC_DEFAULT_CURRENCY_CODE) || "USD"
  );
}
