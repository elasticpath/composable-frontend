import { test, expect } from "@playwright/test";
import { gateway } from "@elasticpath/js-sdk";
import { buildSiteNavigation } from "../src/lib/build-site-navigation";

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
  const cartId = allCookies.find(
    (cookie) => cookie.name === "_store_ep_cart",
  )?.value;

  const nav = await buildSiteNavigation(client);

  const firstNavItem = nav[0];

  if (!firstNavItem) {
    test.skip(
      true,
      "No navigation items found can't test product list page flow",
    );
  }

  await page.getByRole("button", {name: "Shop Now"}).click();

  /* Check to make sure the page has navigated to the product list page for Men's / T-Shirts */
  await expect(page).toHaveURL(`/search`);

  await page.locator('[href*="/products/"]').first().click();

  /* Check to make sure the page has navigated to the product details page for Simple T-Shirt */
  await page.waitForURL(/\/products\//);
});
