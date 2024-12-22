import { test } from "@playwright/test";
import { createD2CProductDetailPage } from "./models/d2c-product-detail-page";
import { client } from "./util/epcc-client";
import { skipIfMissingCatalog } from "./util/missing-published-catalog";

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
