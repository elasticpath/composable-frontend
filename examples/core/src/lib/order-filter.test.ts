import { describe, expect, test } from "vitest";
import {
  orderFilterFromSearchParam,
  orderFilterHref,
  orderListApiFilter,
  paymentStatusLabel,
} from "./order-filter";

describe("orderListApiFilter", () => {
  test("complete asks the Orders API for complete orders only", () => {
    expect(orderListApiFilter(orderFilterFromSearchParam("complete"))).toBe(
      "eq(status,complete)",
    );
  });

  test("payment pending asks the Orders API for unpaid orders only", () => {
    expect(
      orderListApiFilter(orderFilterFromSearchParam("payment-pending")),
    ).toBe("eq(payment,unpaid)");
  });

  test("no filter in the URL asks for every order", () => {
    expect(orderListApiFilter(orderFilterFromSearchParam(undefined))).toBe(
      undefined,
    );
  });

  test("a hand-edited, unknown filter falls back to every order", () => {
    expect(orderFilterFromSearchParam("shipped")).toBe("all");
    expect(orderFilterFromSearchParam("")).toBe("all");
    expect(orderFilterFromSearchParam("COMPLETE")).toBe("all");
    expect(orderListApiFilter(orderFilterFromSearchParam("shipped"))).toBe(
      undefined,
    );
  });

  test("a filter repeated in the URL uses the first value", () => {
    expect(orderFilterFromSearchParam(["complete", "payment-pending"])).toBe(
      "complete",
    );
  });
});

describe("orderFilterHref", () => {
  test("choosing a filter starts again at the first page", () => {
    expect(
      orderFilterHref({ offset: "20", limit: "10" }, "complete"),
    ).toBe("/account/orders?limit=10&filter=complete");
  });

  test("choosing another filter replaces the current one", () => {
    expect(
      orderFilterHref({ filter: "complete", offset: "10" }, "payment-pending"),
    ).toBe("/account/orders?filter=payment-pending");
  });

  test("choosing all orders clears the filter from the URL", () => {
    expect(orderFilterHref({ filter: "complete", offset: "10" }, "all")).toBe(
      "/account/orders",
    );
  });

  test("keeps the page size the shopper chose", () => {
    expect(
      orderFilterHref({ filter: "payment-pending", limit: "1" }, "all"),
    ).toBe("/account/orders?limit=1");
  });
});

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
