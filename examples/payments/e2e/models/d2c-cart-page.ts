import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { getCartId } from "../util/get-cart-id";

export interface D2CCartPage {
  readonly page: Page;
  readonly checkoutBtn: Locator;
  readonly goto: () => Promise<void>;
  readonly checkoutCart: () => Promise<void>;
}

export function createD2CCartPage(page: Page): D2CCartPage {
  const checkoutBtn = page.getByRole("button", { name: "Checkout" });

  return {
    page,
    checkoutBtn,
    async goto() {
      await page.goto(`/cart`);
    },
    async checkoutCart() {
      await checkoutBtn.click();
      const cartId = await getCartId(page)();
      await expect(page).toHaveURL(`/checkout/${cartId}`);
    },
  };
}
