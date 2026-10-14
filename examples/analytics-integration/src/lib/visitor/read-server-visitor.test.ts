import { describe, expect, test } from "vitest";
import { CONSENT_COOKIE_NAME } from "./consent-cookie";
import { resolveServerVisitor } from "./read-server-visitor";

const validId = "0123456789abcdef0123456789abcdef";

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
});
