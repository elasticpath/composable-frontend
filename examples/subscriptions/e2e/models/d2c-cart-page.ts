import type { Locator, Page } from "@playwright/test";

export interface D2CCartPage {
  readonly page: Page;
  readonly checkoutBtn: Locator;
  readonly goto: () => Promise<void>;
  readonly checkoutCart: () => Promise<void>;
}

export function createD2CCartPage(page: Page): D2CCartPage {
  const checkoutBtn = page.getByRole("link", { name: "Checkout" });

  return {
    page,
    checkoutBtn,
    async goto() {
      await page.goto(`/cart`);
    },
    async checkoutCart() {
      await checkoutBtn.click();
    },
  };
}
