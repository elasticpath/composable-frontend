import { test, expect } from "@playwright/test";
import { gateway } from "@moltin/sdk";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const client_id = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;

const client = gateway({
  client_id,
  host,
});

test("should be able to use quick view to view full product details", async ({
  page,
  isMobile,
}) => {
  /* Go to home page */
  await page.goto("/");

  /* Get the cart id from the cookie */
  const allCookies = await page.context().cookies();
  const cartId = allCookies.find((cookie) => cookie.name === "_store_ep_cart")
    ?.value;

  /* Mobile - open hamburger menu */
  if (isMobile) {
    await page.getByRole("button", { name: "Menu" }).click();
  }

  /* Select the Men's / T-Shirts menu option */
  await page.getByRole("button", { name: "Men's", exact: true }).click();
  await page.getByRole("menuitem", { name: "T-Shirts", exact: true }).click();

  /* Check to make sure the page has navigated to the product list page for Men's / T-Shirts */
  await expect(page).toHaveURL("/search/menswear/shirts/t-shirts");

  await page
    .getByTestId("2f435914-03b5-4b9e-80cb-08d3baa4c1d3")
    .getByRole("button", { name: "Quick View" })
    .click();

  await page.getByRole("link", { name: "View full details" }).click();

  /* Check to make sure the page has navigated to the product details page for Simple T-Shirt */
  await page.waitForURL("/products/2f435914-03b5-4b9e-80cb-08d3baa4c1d3");
  await expect(page).toHaveURL(
    "/products/2f435914-03b5-4b9e-80cb-08d3baa4c1d3",
  );
});
