import { gateway, MemoryStorageFactory } from "@elasticpath/js-sdk";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const client_id = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;
const client_secret = process.env.EPCC_CLIENT_SECRET;

export const adminClient = gateway({
  client_id,
  client_secret,
  host,
  throttleEnabled: true,
  name: "admin_client",
  storage: new MemoryStorageFactory(),
});
