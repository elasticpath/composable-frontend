import { test } from "@playwright/test";
import { gateway } from "@moltin/sdk";
import { createD2CProductDetailPage } from "./models/d2c-product-detail-page";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const client_id = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;

const client = gateway({
  client_id,
  host,
  throttleEnabled: true,
});

test.describe("Product Details Page", async () => {
  test("should add a simple product to cart", async ({ page }) => {
    const productDetailPage = createD2CProductDetailPage(page, client);

    /* Go to base product page */
    await productDetailPage.gotoSimpleProduct();

    /* Add the product to cart */
    await productDetailPage.addProductToCart();
  });

  test("should add variation product to cart", async ({ page }) => {
    const productDetailPage = createD2CProductDetailPage(page, client);

    /* Go to base product page */
    await productDetailPage.gotoVariationsProduct();

    /* Select the product variations */
    await productDetailPage.gotoProductVariation();

    /* Add the product to cart */
    await productDetailPage.addProductToCart();
  });
});
