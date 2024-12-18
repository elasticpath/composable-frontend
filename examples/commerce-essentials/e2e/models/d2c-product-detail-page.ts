import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  getProductById,
  getSimpleProduct,
  getVariationsProduct,
} from "../util/resolver-product-from-store";
import type {ElasticPath, ProductResponse } from "@elasticpath/js-sdk";
import { getCartId } from "../util/get-cart-id";
import { getSkuIdFromOptions } from "../../src/lib/product-helper";

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
  client: ElasticPath,
): D2CProductDetailPage {
  let activeProduct: ProductResponse | undefined;
  const addToCartBtn = page.getByRole("button", { name: "Add to Cart" });

  return {
    page,
    async gotoSimpleProduct() {
      activeProduct = await getSimpleProduct(client);
      await skipOrGotoProduct(
        page,
        "Can't run test because there is no simple product published in the store.",
        activeProduct,
      );
    },
    async gotoVariationsProduct() {
      activeProduct = await getVariationsProduct(client);
      await skipOrGotoProduct(
        page,
        "Can't run test because there is no variation product published in the store.",
        activeProduct,
      );
    },
    async gotoProductVariation() {
      expect(
        activeProduct,
        "Make sure you call one of the gotoVariationsProduct function first before calling gotoProductVariation",
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
        "Make sure you call one of the gotoProduct function first before calling addProductToCart",
      ).toBeDefined();
      /* Get the cart id */
      const cartId = await getCartId(page)();

      /* Add the product to cart */
      await addToCartBtn.click();
      /* Wait for the cart POST request to complete */
      const reqUrl = `https://${host}/v2/carts/${cartId}/items`;
      await page.waitForResponse(reqUrl);

      /* Check to make sure the product has been added to cart */
      const result = await client.Cart(cartId).With("items").Get();
      await expect(
        activeProduct?.attributes.price,
        "Missing price on active product - make sure the product has a price set can't add to cart without one.",
      ).toBeDefined();
      await expect(
        result.included?.items.find(
          (item) => item.product_id === activeProduct!.id,
        ),
      ).toHaveProperty("product_id", activeProduct!.id);
    },
  };
}

async function skipOrGotoProduct(
  page: Page,
  msg: string,
  product?: ProductResponse,
) {
  if (!product) {
    test.skip(!product, msg);
  } else {
    await page.goto(`/products/${product.id}`);
  }
}

async function selectOptions(
  baseProduct: ProductResponse,
  page: Page,
): Promise<string> {
  /* select one of each variation option */
  const options = baseProduct.meta.variations?.reduce((acc, variation) => {
    return [...acc, ...([variation.options?.[0]] ?? [])];
  }, []);

  if (options && baseProduct.meta.variation_matrix) {
    for (const option of options) {
      await page.click(`text=${option.name}`);
    }

    const variationId = getSkuIdFromOptions(
      options.map((x) => x.id),
      baseProduct.meta.variation_matrix,
    );

    if (!variationId) {
      throw new Error("Unable to resolve variation id.");
    }
    return variationId;
  }

  throw Error("Unable to select options they were not defined.");
}
