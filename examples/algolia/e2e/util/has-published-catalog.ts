import type { Moltin as EPCCClient } from "@moltin/sdk";

export async function hasPublishedCatalog(
  client: EPCCClient,
): Promise<boolean> {
  try {
    await client.ShopperCatalog.Get();
    return false;
  } catch (err) {
    return true;
  }
}
