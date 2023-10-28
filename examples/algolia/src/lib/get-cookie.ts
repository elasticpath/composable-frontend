import "server-only";
import {
  RequestCookie,
  parseCookie,
} from "next/dist/compiled/@edge-runtime/cookies";
import { cookies, headers } from "next/headers";

/**
 * required to work around this issue - https://github.com/vercel/next.js/issues/49442
 *
 * Cookies will not be set for the first response from and have to be fethched from the value set by middleware in the
 * raw Set-Cookie header.
 */
export function getCookie(cookieName: string): RequestCookie | undefined {
  const allCookiesAsString = headers().get("Set-Cookie");

  if (!allCookiesAsString) {
    return cookies().get(cookieName);
  }

  const allCookiesAsObjects = allCookiesAsString
    .split(", ")
    .map((singleCookieAsString) => parseCookie(singleCookieAsString.trim()));

  const targetCookieAsObject = allCookiesAsObjects.find(
    (singleCookieAsObject) =>
      typeof singleCookieAsObject.get(cookieName) == "string",
  );

  if (!targetCookieAsObject) {
    return cookies().get(cookieName);
  }

  return {
    name: cookieName,
    value: targetCookieAsObject.get(cookieName) ?? "",
  };
}
