import { test } from "@playwright/test";
import { createD2CProductDetailPage } from "./models/d2c-product-detail-page";
import { client } from "./util/epcc-client";
import { createD2CCartPage } from "./models/d2c-cart-page";
import { createD2CCheckoutPage } from "./models/d2c-checkout-page";

test.describe("Checkout flow", async () => {
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
      Email: { value: "test@tester.com", fieldType: "input" },
      "First Name": { value: "Jim", fieldType: "input" },
      "Last Name": { value: "Brown", fieldType: "input" },
      "Street Address": { value: "Main Street", fieldType: "input" },
      "Extended Address": { value: "Extended Address", fieldType: "input" },
      City: { value: "Brownsville", fieldType: "input" },
      County: { value: "Brownsville County", fieldType: "input" },
      Region: { value: "Browns", fieldType: "input" },
      Postcode: { value: "ABC 123", fieldType: "input" },
      Country: { value: "Algeria", fieldType: "select" },
      "Phone Number": { value: "01234567891", fieldType: "input" },
      "Additional Instructions": {
        value: "This is some extra instructions.",
        fieldType: "input",
      },
    });

    await checkoutPage.checkout();
    await checkoutPage.checkOrderComplete;

    /* Continue Shopping */
    await checkoutPage.continueShopping();
  });
});
