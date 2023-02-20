import { test, expect } from "@playwright/test";
import { gateway } from "@moltin/sdk";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const client_id = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;

const client = gateway({
  client_id,
  host,
});

test("should load home page", async ({ page }) => {
  await page.goto("/");
});

test("should add product to cart", async ({ page }) => {
  /* Go to base product page */
  await page.goto("/products/2f435914-03b5-4b9e-80cb-08d3baa4c1d3");

  /* Get the cart id from the cookie */
  const allCookies = await page.context().cookies();
  const cartId = allCookies.find(
    (cookie) => cookie.name === "_store_ep_cart"
  )?.value;

  /* Select the product variations */
  await page.click("text=SM");
  await page.click("text=Grey");
  await page.click("text=Short");

  /* Check to make sure the page has navigated to the selected product */
  await expect(page).toHaveURL(
    "/products/84ca8ab1-8053-4723-b574-7bd3cea12880"
  );

  /* Add the product to cart */
  await page.click("text=Add to Cart");

  /* Wait for the cart POST request to complete */
  const reqUrl = `https://${host}/v2/carts/${cartId}/items`;
  await page.waitForResponse(reqUrl);

  /* Check to make sure the product has been added to cart */
  const result = await client.Cart(cartId).With("items").Get();
  await expect(
    result.included?.items.find(
      (item) => item.product_id === "84ca8ab1-8053-4723-b574-7bd3cea12880"
    )
  ).toHaveProperty("product_id", "84ca8ab1-8053-4723-b574-7bd3cea12880");
});