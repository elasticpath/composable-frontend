import { test } from "@playwright/test";

export function skipIfCIEnvironment(): void {
  test.skip(
    process.env.CI === "true",
    "Skipping tests because we are in a CI environment.",
  );
}
