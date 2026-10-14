import { describe, expect, test } from "vitest";
import { consent } from "./consent";
import {
  CONSENT_COOKIE_NAME,
  GRANT_ALL_CONSENT_COOKIE_VALUE,
} from "./consent-cookie";

const requestWith = (cookie?: string) =>
  new Request("https://shop.example.test/", {
    headers: cookie ? { cookie } : {},
  });

describe("consent", () => {
  test("is none while the shopper has not answered the banner", () => {
    expect(consent(requestWith())).toEqual({ state: "none" });
    expect(consent(requestWith("theme=dark"))).toEqual({ state: "none" });
  });

  test("grants analytics and personalization after the shopper accepts", () => {
    expect(
      consent(
        requestWith(
          `theme=dark; ${CONSENT_COOKIE_NAME}=${GRANT_ALL_CONSENT_COOKIE_VALUE}`,
        ),
      ),
    ).toEqual({
      state: "granted",
      purposes: ["analytics", "personalization"],
    });
  });

  test("reads the purposes the consent cookie lists and ignores unknown values", () => {
    expect(
      consent(requestWith(`${CONSENT_COOKIE_NAME}=analytics,telepathy`)),
    ).toEqual({ state: "granted", purposes: ["analytics"] });
  });

  test("is none when the consent cookie lists no purpose this store knows", () => {
    expect(consent(requestWith(`${CONSENT_COOKIE_NAME}=telepathy`))).toEqual({
      state: "none",
    });
  });
});
