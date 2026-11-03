import { NextFetchEvent, NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CONSENT_COOKIE_NAME } from "../visitor/consent-cookie";

const visitorId = "0123456789abcdef0123456789abcdef";
const accessToken = {
  access_token: "token",
  expires: 4102444800,
  token_type: "Bearer",
};

type Sent = { path: string; headers: Headers };

function stubElasticPath(): Sent[] {
  const sent: Sent[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: Request | string | URL, init?: RequestInit) => {
      const request =
        input instanceof Request ? input : new Request(input, init);
      sent.push({
        path: new URL(request.url).pathname,
        headers: request.headers,
      });
      const body = request.url.endsWith("/oauth/access_token")
        ? accessToken
        : {
            data: {
              id: "cart-id",
              meta: { timestamps: { expires_at: "2100-01-01T00:00:00Z" } },
            },
          };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
  );
  return sent;
}

async function visitFirstTime(cookie: string) {
  const { composeMiddleware } = await import("./run-middleware");
  const { visitorMiddleware } = await import("../visitor/visitor-middleware");
  const { implicitAuthMiddleware } = await import("./implicit-auth-middleware");
  const { cartCookieMiddleware } = await import("./cart-cookie-middleware");

  return composeMiddleware([
    visitorMiddleware,
    implicitAuthMiddleware,
    cartCookieMiddleware,
  ])(
    new NextRequest("https://shop.example.test/", { headers: { cookie } }),
    {} as NextFetchEvent,
  );
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_EPCC_ENDPOINT_URL", "api.example.test");
  vi.stubEnv("NEXT_PUBLIC_EPCC_CLIENT_ID", "client-id");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("the Elastic Path calls the middleware makes on a first visit", () => {
  test("carry the visitor id resolved for this request, the same one the response sets", async () => {
    const sent = stubElasticPath();

    const response = await visitFirstTime(
      `${CONSENT_COOKIE_NAME}=analytics,personalization`,
    );

    const setCookieId = response.headers
      .getSetCookie()
      .map((cookie) => /^ep_vid=([0-9a-f]{32});/.exec(cookie)?.[1])
      .find(Boolean);
    expect(setCookieId).toBeDefined();
    expect(sent.map(({ path }) => path)).toEqual([
      "/oauth/access_token",
      "/v2/carts",
    ]);
    for (const { headers } of sent) {
      expect(headers.get("EP-Visitor-Id")).toBe(setCookieId);
      expect(headers.get("EP-Visitor-Consent")).toBe(
        "analytics,personalization",
      );
    }
  });

  test("carry the id the shopper already has", async () => {
    const sent = stubElasticPath();

    await visitFirstTime(
      `${CONSENT_COOKIE_NAME}=analytics; ep_vid=${visitorId}`,
    );

    for (const { headers } of sent) {
      expect(headers.get("EP-Visitor-Id")).toBe(visitorId);
      expect(headers.get("EP-Visitor-Consent")).toBe("analytics");
    }
  });

  test("carry no visitor header for a shopper who rejected", async () => {
    const sent = stubElasticPath();

    await visitFirstTime(`${CONSENT_COOKIE_NAME}=rejected`);

    expect(sent).toHaveLength(2);
    for (const { headers } of sent) {
      expect(headers.get("EP-Visitor-Id")).toBeNull();
      expect(headers.get("EP-Visitor-Consent")).toBeNull();
    }
  });

  test("carry EP-Analytics: off when the example is set to keep its traffic out of analytics", async () => {
    vi.stubEnv("EP_ANALYTICS_OFF", "true");
    const sent = stubElasticPath();

    await visitFirstTime(`${CONSENT_COOKIE_NAME}=rejected`);

    for (const { headers } of sent) {
      expect(headers.get("EP-Analytics")).toBe("off");
    }
  });
});
