import { describe, expect, test } from "vitest";
import { isAnalyticsOff } from "./analytics-off";

describe("isAnalyticsOff", () => {
  test("is on when EP_ANALYTICS_OFF is true", () => {
    expect(isAnalyticsOff({ EP_ANALYTICS_OFF: "true" })).toBe(true);
  });

  test("is off when EP_ANALYTICS_OFF is not set", () => {
    expect(isAnalyticsOff({})).toBe(false);
  });

  test.each(["", "false", "0", "off", "yes"])(
    "is off when EP_ANALYTICS_OFF is %j",
    (value) => {
      expect(isAnalyticsOff({ EP_ANALYTICS_OFF: value })).toBe(false);
    },
  );
});
