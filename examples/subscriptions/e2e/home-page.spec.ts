import { test } from "@playwright/test";
import { createD2CHomePage } from "./models/d2c-home-page";
import { skipIfMissingCatalog } from "./util/missing-published-catalog";

test.describe("Home Page", async () => {
  test("should load home page", async ({ page }) => {
    const d2cHomePage = createD2CHomePage(page);
    await d2cHomePage.goto();
  });
});
