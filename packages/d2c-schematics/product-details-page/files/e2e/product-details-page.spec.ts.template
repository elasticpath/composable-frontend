import { test, expect } from '@playwright/test'
import {gateway} from '@moltin/sdk'

const client = gateway({
    client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID,
    host: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL
})

test('should load home page', async ({ page }) => {
    await page.goto('/')
})

test('should navigate to cart page', async ({ page }) => {
    await page.goto('/')
    // Find an element with the text 'About Page' and click on it
    await page.click('[data-test=open-cart]')

    await page.click('text=View Cart')
    // The new URL should be "/about" (baseURL is used there)
    await expect(page).toHaveURL('/cart')
    // The new page should contain an h1 with "About Page"
    await expect(page.locator('h2')).toContainText('Your cart is empty')
})

test('should add product to cart', async ({ page }) => {
    /* Go to base product page */
    await page.goto('/products/2f435914-03b5-4b9e-80cb-08d3baa4c1d3')

    /* Get the cart id from the cookie */
    const allCookies = await page.context().cookies()
    const cartId = allCookies.find((cookie) => cookie.name === '_store_ep_cart').value

    /* Select the product variations */
    await page.click('text=SM')
    await page.click('text=Teal')
    await page.click('text=Short')

    /* Check to make sure the page has navigated to the selected product */
    await expect(page).toHaveURL('/products/da54af20-440d-477d-b671-ef0d8fb77de6')

    /* Add the product to cart */
    await page.click('text=Add to Cart')

    /* Wait for the cart POST request to complete */
    const reqUrl = `https://euwest.api.elasticpath.com/v2/carts/${cartId}/items`;
    await page.waitForResponse(reqUrl)

    /* Check to make sure the product has been added to cart */
    const result = await client.Cart(cartId).With("items").Get()
    await expect(result.included.items.find((item) => item.product_id === 'da54af20-440d-477d-b671-ef0d8fb77de6')).toHaveProperty('product_id', 'da54af20-440d-477d-b671-ef0d8fb77de6')
})