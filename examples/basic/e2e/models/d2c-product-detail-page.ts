import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  getProductById,
  getSimpleProduct,
  getVariationsProduct,
} from "../util/resolver-product-from-store";
import {
  Moltin as EPCCClient,
  ProductResponse,
  Option,
  MatrixObject,
} from "@moltin/sdk";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;

export interface D2CProductDetailPage {
  readonly page: Page;
  readonly gotoSimpleProduct: () => Promise<void>;
  readonly gotoVariationsProduct: () => Promise<void>;
  readonly getCartId: () => Promise<string>;
  readonly addProductToCart: () => Promise<void>;
  readonly gotoProductVariation: () => Promise<void>;
}

export function createD2CProductDetailPage(
  page: Page,
  client: EPCCClient
): D2CProductDetailPage {
  let activeProduct: ProductResponse | undefined;

  return {
    page,
    async gotoSimpleProduct() {
      activeProduct = await getSimpleProduct(client);
      await page.goto(`/products/${activeProduct.id}`);
    },
    async gotoVariationsProduct() {
      activeProduct = await getVariationsProduct(client);
      await page.goto(`/products/${activeProduct.id}`);
    },
    async gotoProductVariation() {
      expect(
        activeProduct,
        "Make sure you call one of the gotoVariationsProduct function first before calling gotoProductVariation"
      ).toBeDefined();
      expect(activeProduct?.attributes.base_product).toEqual(true);

      const expectedProductId = await selectOptions(activeProduct!, page);
      const product = await getProductById(client, expectedProductId);

      expect(product.data?.id).toBeDefined();
      activeProduct = product.data;

      /* Check to make sure the page has navigated to the selected product */
      await expect(page).toHaveURL(`/products/${expectedProductId}`);
    },
    getCartId: getCartId(page),
    async addProductToCart() {
      expect(
        activeProduct,
        "Make sure you call one of the gotoProduct function first before calling addProductToCart"
      ).toBeDefined();
      /* Get the cart id */
      const cartId = await getCartId(page)();

      /* Add the product to cart */
      await page.click("text=Add to Cart");
      /* Wait for the cart POST request to complete */
      const reqUrl = `https://${host}/v2/carts/${cartId}/items`;
      await page.waitForResponse(reqUrl);

      /* Check to make sure the product has been added to cart */
      const result = await client.Cart(cartId).With("items").Get();
      await expect(
        result.included?.items.find(
          (item) => item.product_id === activeProduct!.id
        )
      ).toHaveProperty("product_id", activeProduct!.id);
    },
  };
}

async function selectOptions(
  baseProduct: ProductResponse,
  page: Page
): Promise<string> {
  const options = baseProduct.meta.variations?.reduce((acc, variation) => {
    return [...acc, ...([variation.options?.[0]] ?? [])];
  }, []);

  if (options && baseProduct.meta.variation_matrix) {
    for (const option of options) {
      await page.click(`text=${option.name}`);
    }

    return lookupMatrix(options, baseProduct.meta.variation_matrix);
  }

  throw Error("Unable to select options they were not defined.");
}

function lookupMatrix(
  [head, ...tail]: Omit<Option, "modifiers">[],
  matrix: MatrixObject
): string {
  const reducedMatrixOrId = matrix[head.id];
  if (!isMatrixObject(reducedMatrixOrId)) {
    return reducedMatrixOrId;
  } else {
    return lookupMatrix(tail, reducedMatrixOrId);
  }
}

function isMatrixObject(obj: unknown): obj is MatrixObject {
  return typeof obj !== "string";
}

function getCartId(page: Page) {
  return async function _getCartId(): Promise<string> {
    /* Get the cart id from the cookie */
    const allCookies = await page.context().cookies();
    const cartId = allCookies.find(
      (cookie) => cookie.name === "_store_ep_cart"
    )?.value;

    expect(cartId).toBeDefined();
    return cartId!;
  };
}
