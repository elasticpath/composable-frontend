import { afterEach, describe, expect, test, vi } from "vitest";
import { consent } from "./consent";
import {
  CONSENT_COOKIE_NAME,
  GRANT_ALL_CONSENT_COOKIE_VALUE,
  REJECTED_CONSENT_COOKIE_VALUE,
  consentCookieValueFor,
} from "./consent-cookie";
import { SESSION_VISITOR_ID_ENV } from "./session-visitor-id";

const requestWith = (headers: Record<string, string> = {}) =>
  new Request("https://shop.example.test/", { headers });

const requestWithCookie = (cookie: string, headers = {}) =>
  requestWith({ cookie, ...headers });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("consent", () => {
  test("is none while the shopper has not answered the banner", () => {
    expect(consent(requestWith())).toEqual({ state: "none" });
    expect(consent(requestWithCookie("theme=dark"))).toEqual({
      state: "none",
    });
  });

  test("grants analytics and personalization after the shopper accepts", () => {
    expect(
      consent(
        requestWithCookie(
          `theme=dark; ${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}`,
        ),
      ),
    ).toEqual({
      state: "granted",
      purposes: ["analytics", "personalization"],
    });
  });

  test("grants only the purposes the shopper chose when customizing", () => {
    expect(
      consent(requestWithCookie(`${CONSENT_COOKIE_NAME}=analytics`)),
    ).toEqual({ state: "granted", purposes: ["analytics"] });
    expect(
      consent(requestWithCookie(`${CONSENT_COOKIE_NAME}=personalization`)),
    ).toEqual({ state: "granted", purposes: ["personalization"] });
  });

  test("ignores purposes this store does not know", () => {
    expect(
      consent(requestWithCookie(`${CONSENT_COOKIE_NAME}=analytics,telepathy`)),
    ).toEqual({ state: "granted", purposes: ["analytics"] });
  });

  test("is none when the consent cookie lists no purpose this store knows", () => {
    expect(
      consent(requestWithCookie(`${CONSENT_COOKIE_NAME}=telepathy`)),
    ).toEqual({ state: "none" });
  });

  test("is an objection after the shopper rejects all", () => {
    expect(
      consent(
        requestWithCookie(
          `${CONSENT_COOKIE_NAME}=${REJECTED_CONSENT_COOKIE_VALUE}`,
        ),
      ),
    ).toEqual({ state: "objected" });
  });

  test("treats Global Privacy Control as an objection, even after the shopper accepted", () => {
    expect(consent(requestWith({ "Sec-GPC": "1" }))).toEqual({
      state: "objected",
    });
    expect(
      consent(
        requestWithCookie(
          `${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}`,
          { "Sec-GPC": "1" },
        ),
      ),
    ).toEqual({ state: "objected" });
  });
});

describe("consent with the session id opt-in", () => {
  test("opts in to the session id only while the shopper has not decided", () => {
    vi.stubEnv(SESSION_VISITOR_ID_ENV, "true");

    expect(consent(requestWith())).toEqual({ state: "none", sessionId: true });
    expect(
      consent(requestWithCookie(`${CONSENT_COOKIE_NAME}=analytics`)),
    ).toEqual({ state: "granted", purposes: ["analytics"] });
    expect(
      consent(
        requestWithCookie(
          `${CONSENT_COOKIE_NAME}=${REJECTED_CONSENT_COOKIE_VALUE}`,
        ),
      ),
    ).toEqual({ state: "objected" });
    expect(consent(requestWith({ "Sec-GPC": "1" }))).toEqual({
      state: "objected",
    });
  });

  test.each([[undefined], [""], ["false"], ["1"]])(
    "does not opt in when %j",
    (value) => {
      vi.stubEnv(SESSION_VISITOR_ID_ENV, value);

      expect(consent(requestWith())).toEqual({ state: "none" });
    },
  );
});

describe("consentCookieValueFor", () => {
  test("lists the purposes the shopper chose", () => {
    expect(consentCookieValueFor(["analytics", "personalization"])).toBe(
      GRANT_ALL_CONSENT_COOKIE_VALUE,
    );
    expect(consentCookieValueFor(["analytics"])).toBe("analytics");
  });

  test("is the rejection when the shopper chose no purpose", () => {
    expect(consentCookieValueFor([])).toBe(REJECTED_CONSENT_COOKIE_VALUE);
  });
});
