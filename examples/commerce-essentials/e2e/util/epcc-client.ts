import { gateway, MemoryStorageFactory } from "@elasticpath/js-sdk";

const host = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL;
const client_id = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID;

export const client = gateway({
  client_id,
  host,
  throttleEnabled: true,
  name: "implicit_client",
  storage: new MemoryStorageFactory(),
});
