import { describe, expect, test } from "vitest";
import { getErrorMessage } from "./get-error-message";

describe("getErrorMessage", () => {
  test("reads the detail of an Elastic Path API error response", () => {
    const apiError = {
      errors: [
        {
          title: "Not Found",
          detail: "Promotion with code SPRING10 not found",
        },
      ],
    };

    expect(getErrorMessage(apiError)).toBe(
      "Promotion with code SPRING10 not found",
    );
  });

  test("falls back to the title when an API error has no detail", () => {
    expect(getErrorMessage({ errors: [{ title: "Bad Request" }] })).toBe(
      "Bad Request",
    );
  });

  test("joins every error in an API error response", () => {
    const apiError = {
      errors: [{ detail: "First problem." }, { detail: "Second problem." }],
    };

    expect(getErrorMessage(apiError)).toBe("First problem. Second problem.");
  });

  test("an API error response with no errors is a generic failure", () => {
    expect(getErrorMessage({ errors: [] })).toBe("Something went wrong.");
  });

  test("reads the message of an Error", () => {
    expect(getErrorMessage(new Error("Cart cookie not found"))).toBe(
      "Cart cookie not found",
    );
  });

  test("passes a string through", () => {
    expect(getErrorMessage("Invalid code")).toBe("Invalid code");
  });

  test("anything else is a generic failure", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong.");
  });
});
