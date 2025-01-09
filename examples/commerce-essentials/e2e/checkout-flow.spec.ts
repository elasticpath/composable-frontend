import { test } from "@playwright/test";
import { createD2CProductDetailPage } from "./models/d2c-product-detail-page";
import { client } from "./util/epcc-client";
import { createD2CCartPage } from "./models/d2c-cart-page";
import { createD2CCheckoutPage } from "./models/d2c-checkout-page";
import { gatewayIsEnabled } from "./util/gateway-is-enabled";
import { skipIfCIEnvironment } from "./util/skip-ci-env";

test.describe("Checkout flow", async () => {
  test.beforeEach(async () => {
    skipIfCIEnvironment();
    await gatewayIsEnabled();
  });

  test("should perform product checkout", async ({ page }) => {
    const productDetailPage = createD2CProductDetailPage(page, client);
    const cartPage = createD2CCartPage(page);
    const checkoutPage = createD2CCheckoutPage(page);

    /* Go to simple product page */
    await productDetailPage.gotoSimpleProduct();

    /* Add the product to cart */
    await productDetailPage.addProductToCart();

    /* Go to cart page and checkout */
    await cartPage.goto();
    await cartPage.checkoutCart();

    /* Enter information */
    await checkoutPage.enterInformation({
      "Email Address": { value: "test@tester.com", fieldType: "input" },
      "First Name": { value: "Jim", fieldType: "input" },
      "Last Name": { value: "Brown", fieldType: "input" },
      Address: { value: "Main Street", fieldType: "input" },
      City: { value: "Brownsville", fieldType: "input" },
      Region: { value: "Browns", fieldType: "input" },
      Postcode: { value: "ABC 123", fieldType: "input" },
      Country: { value: "Algeria", fieldType: "combobox" },
      "Phone Number": { value: "01234567891", fieldType: "input" },
    });

    /* Move to payment */
    await checkoutPage.checkout();

    await checkoutPage.enterPaymentInformation({
      "Card number": { value: "4242424242424242", fieldType: "input" },
      CVC: { value: "123", fieldType: "input" },
      Country: { value: "United Kingdom", fieldType: "select" },
      "Postal code": { value: "EC2R 8AH", fieldType: "input" },
      Expiration: {
        value: "1272",
        fieldType: "input",
        options: { exact: false },
      },
    });

    await checkoutPage.submitPayment();

    /* Continue Shopping */
    await checkoutPage.continueShopping();
  });
});
