import { NextFetchEvent, NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { composeMiddleware } from "../middleware/run-middleware";
import {
  CONSENT_COOKIE_NAME,
  GRANT_ALL_CONSENT_COOKIE_VALUE,
} from "./consent-cookie";
import { visitorMiddleware } from "./visitor-middleware";

const validId = "0123456789abcdef0123456789abcdef";

async function visit(cookie?: string) {
  const request = new NextRequest("https://shop.example.test/", {
    headers: cookie ? { cookie } : {},
  });
  const response = await composeMiddleware([visitorMiddleware])(
    request,
    {} as NextFetchEvent,
  );
  return response.headers.getSetCookie();
}

describe("visitorMiddleware", () => {
  test("sets ep_vid on the first response after the shopper accepts", async () => {
    const setCookies = await visit(
      `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}`,
    );

    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]).toMatch(/^ep_vid=[0-9a-f]{32};/);
    expect(setCookies[0]).toContain("Path=/");
    expect(setCookies[0]).toContain("Max-Age=31536000");
    expect(setCookies[0]).toContain("Secure");
    expect(setCookies[0]).toMatch(/SameSite=lax/i);
    expect(setCookies[0]).not.toContain("HttpOnly");
  });

  test("hands the new ep_vid to the render of the same request, so its calls and the cookie share one id", async () => {
    const request = new NextRequest("https://shop.example.test/", {
      headers: {
        cookie: `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}`,
      },
    });

    const response = await composeMiddleware([visitorMiddleware])(
      request,
      {} as NextFetchEvent,
    );

    const setCookieId = /^ep_vid=([0-9a-f]{32});/.exec(
      response.headers.getSetCookie()[0]!,
    )?.[1];
    expect(setCookieId).toBeDefined();
    expect(response.headers.get("x-middleware-set-cookie")).toContain(
      `ep_vid=${setCookieId}`,
    );
  });

  test("sets no cookie when the shopper already has an ep_vid", async () => {
    const setCookies = await visit(
      `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}; ep_vid=${validId}`,
    );

    expect(setCookies).toEqual([]);
  });

  test("sets no cookie while the shopper has not answered the banner", async () => {
    expect(await visit()).toEqual([]);
  });
});
