import { createClient, createVisitorInterceptor } from "@epcc-sdk/sdks-shopper";
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs";
import {
  ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  CREDENTIALS_COOKIE_NAME,
} from "./cookie-constants";
import { readServerVisitor } from "./visitor/read-server-visitor";

export function createElasticPathClient() {
  const localClient = createClient({
    // set default base url for requests made by this client
    baseUrl: `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}`,
  });
  applyDefaultNextMiddleware(localClient, {
    cookieKey: CREDENTIALS_COOKIE_NAME,
    accountCookieKey: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  });
  applyMultiLocationInventoryMiddleware(localClient);
  applyVisitorMiddleware(localClient);

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

function applyVisitorMiddleware(client: ReturnType<typeof createClient>) {
  if (typeof window !== "undefined") {
    return;
  }
  client.interceptors.request.use(createVisitorInterceptor(readServerVisitor));
}
