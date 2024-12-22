import { Page } from "@playwright/test";
import { fillAllFormFields, FormInput } from "./fill-form-field";

export async function enterPaymentInformation(page: Page, values: FormInput) {
  const paymentIframe = await page
    .locator('[id="payment-element"]')
    .frameLocator("iframe");

  await fillAllFormFields(paymentIframe, values);
}
