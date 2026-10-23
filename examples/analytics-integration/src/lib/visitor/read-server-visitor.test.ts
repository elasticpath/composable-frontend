import { afterEach, describe, expect, test, vi } from "vitest";
import { CONSENT_COOKIE_NAME } from "./consent-cookie";
import { resolveServerVisitor } from "./read-server-visitor";
import { SESSION_VISITOR_ID_ENV } from "./session-visitor-id";

const validId = "0123456789abcdef0123456789abcdef";
const sessionId = "fedcba9876543210fedcba9876543210";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveServerVisitor", () => {
  test("reads a consent cookie whose value holds a comma", async () => {
    const visitor = await resolveServerVisitor(
      [
        { name: CONSENT_COOKIE_NAME, value: "analytics,personalization" },
        { name: "ep_vid", value: validId },
      ],
      new Headers(),
    );

    expect(visitor).toEqual({
      kind: "lasting",
      id: validId,
      purposes: ["analytics", "personalization"],
    });
  });

  test("is none while the shopper has not answered the banner", async () => {
    const visitor = await resolveServerVisitor(
      [{ name: "theme", value: "dark" }],
      new Headers(),
    );

    expect(visitor).toEqual({ kind: "none" });
  });

  test("reads the session id from ep_vsid when the merchant opted in and the shopper has not decided", async () => {
    vi.stubEnv(SESSION_VISITOR_ID_ENV, "true");

    const visitor = await resolveServerVisitor(
      [{ name: "ep_vsid", value: sessionId }],
      new Headers(),
    );

    expect(visitor).toEqual({ kind: "session", id: sessionId });
  });

  test("ignores ep_vsid without the opt-in", async () => {
    const visitor = await resolveServerVisitor(
      [{ name: "ep_vsid", value: sessionId }],
      new Headers(),
    );

    expect(visitor).toEqual({ kind: "none" });
  });

  test("is objected after Reject all, with no id even if ep_vid is still present", async () => {
    const visitor = await resolveServerVisitor(
      [
        { name: CONSENT_COOKIE_NAME, value: "rejected" },
        { name: "ep_vid", value: validId },
      ],
      new Headers(),
    );

    expect(visitor).toEqual({ kind: "objected" });
  });

  test("is objected when the request carries Sec-GPC: 1", async () => {
    const visitor = await resolveServerVisitor(
      [{ name: CONSENT_COOKIE_NAME, value: "analytics" }],
      new Headers({ "Sec-GPC": "1" }),
    );

    expect(visitor).toEqual({ kind: "objected" });
  });
});
