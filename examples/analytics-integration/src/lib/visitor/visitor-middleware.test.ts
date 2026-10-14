import { NextFetchEvent, NextRequest } from "next/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { composeMiddleware } from "../middleware/run-middleware";
import {
  CONSENT_COOKIE_NAME,
  GRANT_ALL_CONSENT_COOKIE_VALUE,
  REJECTED_CONSENT_COOKIE_VALUE,
} from "./consent-cookie";
import { SESSION_VISITOR_ID_ENV } from "./session-visitor-id";
import { visitorMiddleware } from "./visitor-middleware";

const validId = "0123456789abcdef0123456789abcdef";
const sessionId = "fedcba9876543210fedcba9876543210";
const EXPIRED = /Max-Age=0|Expires=Thu, 01 Jan 1970/;

afterEach(() => {
  vi.unstubAllEnvs();
});

async function visit(cookie?: string, headers: Record<string, string> = {}) {
  const request = new NextRequest("https://shop.example.test/", {
    headers: cookie ? { cookie, ...headers } : headers,
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

describe("visitorMiddleware for a shopper who has not decided", () => {
  test("sets no cookie and clears the visitor cookies when they are present", async () => {
    expect(await visit()).toEqual([]);

    const setCookies = await visit(`ep_vid=${validId}; ep_vsid=${sessionId}`);

    expect(setCookies).toHaveLength(2);
    expect(setCookies[0]).toMatch(/^ep_vid=;/);
    expect(setCookies[0]).toMatch(EXPIRED);
    expect(setCookies[1]).toMatch(/^ep_vsid=;/);
    expect(setCookies[1]).toMatch(EXPIRED);
  });

  test("with the opt-in, sets ep_vsid once as a session cookie and keeps it afterwards", async () => {
    vi.stubEnv(SESSION_VISITOR_ID_ENV, "true");

    const first = await visit();
    const later = await visit(`ep_vsid=${sessionId}`);

    expect(first).toHaveLength(1);
    expect(first[0]).toMatch(/^ep_vsid=[0-9a-f]{32};/);
    expect(first[0]).toContain("Path=/");
    expect(first[0]).toContain("Secure");
    expect(first[0]).toContain("HttpOnly");
    expect(first[0]).toMatch(/SameSite=lax/i);
    expect(first[0]).not.toMatch(/Max-Age|Expires/i);
    expect(later).toEqual([]);
  });

  test("with the opt-in, hands the new ep_vsid to the render of the same request", async () => {
    vi.stubEnv(SESSION_VISITOR_ID_ENV, "true");
    const request = new NextRequest("https://shop.example.test/");

    const response = await composeMiddleware([visitorMiddleware])(
      request,
      {} as NextFetchEvent,
    );

    const setCookieId = /^ep_vsid=([0-9a-f]{32});/.exec(
      response.headers.getSetCookie()[0]!,
    )?.[1];
    expect(setCookieId).toBeDefined();
    expect(response.headers.get("x-middleware-set-cookie")).toContain(
      `ep_vsid=${setCookieId}`,
    );
  });
});

describe("visitorMiddleware when the shopper rejects, withdraws or sends Global Privacy Control", () => {
  test("clears ep_vid and ep_vsid after Reject all", async () => {
    const setCookies = await visit(
      `${CONSENT_COOKIE_NAME}=${REJECTED_CONSENT_COOKIE_VALUE}; ep_vid=${validId}; ep_vsid=${sessionId}`,
    );

    expect(setCookies.map((cookie) => cookie.split("=")[0])).toEqual([
      "ep_vid",
      "ep_vsid",
    ]);
    for (const cookie of setCookies) expect(cookie).toMatch(EXPIRED);
  });

  test("clears ep_vid when the request carries Sec-GPC: 1, even after Accept", async () => {
    const setCookies = await visit(
      `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}; ep_vid=${validId}`,
      { "Sec-GPC": "1" },
    );

    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]).toMatch(/^ep_vid=;/);
    expect(setCookies[0]).toMatch(EXPIRED);
  });

  test("clears ep_vsid and sets ep_vid when a shopper with a session id accepts", async () => {
    const setCookies = await visit(
      `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}; ep_vsid=${sessionId}`,
    );

    expect(setCookies).toHaveLength(2);
    expect(setCookies[0]).toMatch(/^ep_vid=[0-9a-f]{32};/);
    expect(setCookies[1]).toMatch(/^ep_vsid=;/);
    expect(setCookies[0]).not.toContain(sessionId);
  });
});
