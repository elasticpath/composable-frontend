import type {
  ProductResponse,
  ResourcePage,
  ShopperCatalogResource,
} from "@elasticpath/js-sdk";
import { wait300 } from "../lib/product-helper";
import { ElasticPath } from "@elasticpath/js-sdk";

export async function getProductById(
  productId: string,
  client: ElasticPath,
): Promise<ShopperCatalogResource<ProductResponse>> {
  return client.ShopperCatalog.Products.With([
    "main_image",
    "files",
    "component_products",
  ]).Get({
    productId,
  });
}

export function getAllProducts(client: ElasticPath): Promise<ProductResponse[]> {
  return _getAllProductPages(client)();
}

export function getProducts(client: ElasticPath, offset = 0, limit = 100) {
  return client.ShopperCatalog.Products.With(["main_image"])
    .Limit(limit)
    .Offset(offset)
    .All();
}

const _getAllPages =
  <T, I>(
    nextPageRequestFn: (
      limit: number,
      offset: number,
      client?: ElasticPath,
    ) => Promise<ResourcePage<T, I>>,
  ) =>
  async (
    offset: number = 0,
    limit: number = 25,
    accdata: T[] = [],
  ): Promise<T[]> => {
    const requestResp = await nextPageRequestFn(limit, offset);
    const {
      meta: {
        page: newPage,
        results: { total },
      },
      data: newData,
    } = requestResp;

    const updatedOffset = offset + newPage.total;
    const combinedData = [...accdata, ...newData];
    if (updatedOffset < total) {
      return wait300.then(() =>
        _getAllPages(nextPageRequestFn)(updatedOffset, limit, combinedData),
      );
    }
    return Promise.resolve(combinedData);
  };

const _getAllProductPages = (client: ElasticPath) =>
  _getAllPages((limit = 25, offset = 0) =>
    client.ShopperCatalog.Products.Limit(limit).Offset(offset).All(),
  );
