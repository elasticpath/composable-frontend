import { ElasticPath } from "@elasticpath/js-sdk";

export function getProducts(client: ElasticPath, offset = 0, limit = 100) {
  return client.ShopperCatalog.Products.With(["main_image"])
    .Limit(limit)
    .Offset(offset)
    .All();
}
