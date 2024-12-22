import type {ElasticPath } from "@elasticpath/js-sdk";

export async function hasPublishedCatalog(
  client: ElasticPath,
): Promise<boolean> {
  try {
    await client.ShopperCatalog.Get();
    return false;
  } catch (err) {
    return true;
  }
}
