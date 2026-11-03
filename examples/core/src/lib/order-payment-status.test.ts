import { describe, expect, test } from "vitest";
import { paymentStatusLabel } from "./order-payment-status";

describe("paymentStatusLabel", () => {
  test("an unpaid order reads as payment pending, matching the filter", () => {
    expect(paymentStatusLabel("unpaid")).toBe("Payment pending");
  });

  test("names each payment status the Orders API returns", () => {
    expect(paymentStatusLabel("paid")).toBe("Paid");
    expect(paymentStatusLabel("authorized")).toBe("Authorized");
    expect(paymentStatusLabel("partially_authorized")).toBe(
      "Partially authorized",
    );
    expect(paymentStatusLabel("partially_paid")).toBe("Partially paid");
    expect(paymentStatusLabel("refunded")).toBe("Refunded");
  });

  test("shows nothing for an order without a payment status", () => {
    expect(paymentStatusLabel(undefined)).toBeUndefined();
    expect(paymentStatusLabel("")).toBeUndefined();
  });

  test("shows a status the API adds later in readable words", () => {
    expect(paymentStatusLabel("partially_refunded")).toBe(
      "Partially refunded",
    );
  });
});
