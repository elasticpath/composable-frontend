import type {
  ElasticPath,
  ShopperCatalogResourcePage,
  ProductResponse,
  ShopperCatalogResource,
} from "@elasticpath/js-sdk";

export async function getSimpleProduct(
  client: ElasticPath,
): Promise<ProductResponse | undefined> {
  const paginator = paginateShopperProducts(client, { limit: 100 });

  if (paginator) {
    for await (const page of paginator) {
      const simpleProduct = page.data.find(
        (x) => !x.attributes.base_product && !x.attributes.base_product_id,
      );
      if (simpleProduct) {
        return simpleProduct;
      }
    }
  }
}

export async function getProductById(
  client: ElasticPath,
  productId: string,
): Promise<ShopperCatalogResource<ProductResponse>> {
  return client.ShopperCatalog.Products.Get({
    productId: productId,
  });
}

export async function getVariationsProduct(
  client: ElasticPath,
): Promise<ProductResponse | undefined> {
  const paginator = paginateShopperProducts(client, { limit: 100 });

  if (paginator) {
    for await (const page of paginator) {
      const variationsProduct = page.data.find(
        (x) => x.attributes.base_product,
      );
      if (variationsProduct) {
        return variationsProduct;
      }
    }
  }
}

const makePagedClientRequest = async (
  client: ElasticPath,
  { limit = 100, offset }: { limit?: number; offset: number },
): Promise<ShopperCatalogResourcePage<ProductResponse>> => {
  return await client.ShopperCatalog.Products.Offset(offset).Limit(limit).All();
};

export type Paginator<T> = AsyncGenerator<T, T, unknown>;

export async function* paginateShopperProducts(
  client: ElasticPath,
  input: { limit?: number; offset?: number },
): Paginator<ShopperCatalogResourcePage<ProductResponse>> | undefined {
  let page: ShopperCatalogResourcePage<ProductResponse>;

  let nextOffset: number = input.offset ?? 0;
  let hasNext = true;

  while (hasNext) {
    page = await makePagedClientRequest(client, {
      limit: input.limit,
      offset: nextOffset,
    });
    yield page;
    const {
      results: { total: totalItems },
      page: { current, limit },
    } = page.meta;
    hasNext = current * limit < totalItems;
    nextOffset = nextOffset + limit;
  }

  return undefined;
}
