import { createClient } from "@epcc-sdk/sdks-shopper";
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs";

export function createElasticPathClient() {
  const localClient = createClient({
    // set default base url for requests made by this client
    baseUrl: `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}`,
  });
  applyDefaultNextMiddleware(localClient);
  applyMultiLocationInventoryMiddleware(localClient);

  return localClient;
}

function applyMultiLocationInventoryMiddleware(
  client: ReturnType<typeof createClient>,
) {
  client.interceptors.request.use((request) => {
    request.headers.set("EP-Inventories-Multi-Location", "true");
    return request;
  });
}
