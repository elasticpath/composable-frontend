import { describe, expect, test } from "vitest";
import { safeReturnPath } from "./return-url";

describe("safeReturnPath", () => {
  test("keeps a path on this site", () => {
    expect(safeReturnPath("/account", "/")).toBe("/account");
    expect(safeReturnPath("/search?q=shoes#top", "/")).toBe(
      "/search?q=shoes#top",
    );
  });

  test("falls back when there is nothing to return to", () => {
    expect(safeReturnPath(undefined, "/")).toBe("/");
    expect(safeReturnPath(null, "/")).toBe("/");
    expect(safeReturnPath("", "/")).toBe("/");
  });

  test.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "\\\\evil.example/phish",
    "javascript:alert(1)",
    "account",
    "/.//evil.example/phish",
    "/..//evil.example/phish",
    "/a/..//evil.example",
    "/%2e//evil.example",
    "/%2E%2E//evil.example",
    "/./\\evil.example",
    "/.\\\\evil.example",
  ])("refuses to send a shopper off site: %s", (returnUrl) => {
    expect(safeReturnPath(returnUrl, "/")).toBe("/");
  });
});
