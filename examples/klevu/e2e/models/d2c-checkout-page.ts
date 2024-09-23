import type { Locator, Page } from "@playwright/test";
import { fillAllFormFields, FormInput } from "../util/fill-form-field";
import { enterPaymentInformation as _enterPaymentInformation } from "../util/enter-payment-information";

export interface D2CCheckoutPage {
  readonly page: Page;
  readonly payNowBtn: Locator;
  readonly checkoutBtn: Locator;
  readonly goto: () => Promise<void>;
  readonly enterInformation: (values: FormInput) => Promise<void>;
  readonly checkout: () => Promise<void>;
  readonly enterPaymentInformation: (values: FormInput) => Promise<void>;
  readonly submitPayment: () => Promise<void>;
  readonly continueShopping: () => Promise<void>;
}

export function createD2CCheckoutPage(page: Page): D2CCheckoutPage {
  const payNowBtn = page.getByRole("button", { name: "Pay $" });
  const checkoutBtn = page.getByRole("button", { name: "Pay $" });
  const continueShoppingBtn = page.getByRole("link", {
    name: "Continue shopping",
  });

  return {
    page,
    payNowBtn,
    checkoutBtn,
    async goto() {
      await page.goto(`/cart`);
    },
    async enterPaymentInformation(values: FormInput) {
      await _enterPaymentInformation(page, values);
    },
    async enterInformation(values: FormInput) {
      await fillAllFormFields(page, values);
    },
    async submitPayment() {
      await payNowBtn.click();
    },
    async checkout() {
      await checkoutBtn.click();
    },
    async continueShopping() {
      await continueShoppingBtn.click();
      await page.waitForURL("/");
    },
  };
}
