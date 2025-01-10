import "server-only";
import { gateway, StorageFactory } from "@elasticpath/js-sdk";
import { epccEnv } from "./resolve-epcc-env";
import { resolveEpccCustomRuleHeaders } from "./custom-rule-headers";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { EP_CURRENCY_CODE } from "./resolve-ep-currency-code";
import { CREDENTIALS_COOKIE_NAME } from "./cookie-constants";
import { cookies } from "next/headers";
import { client, createClient } from "@epcc-sdk/sdks-shopper";
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs";

const customHeaders = resolveEpccCustomRuleHeaders();

const { client_id, host } = epccEnv;

client.setConfig({
  baseUrl: `https://${epccEnv.host}`,
});

applyDefaultNextMiddleware(client);

export function getServerSideImplicitClient() {
  return client;
}

function createServerSideNextCookieStorageFactory(
  initialCookieValue?: string,
): StorageFactory {
  let state = new Map<string, string>();

  if (initialCookieValue) {
    state.set(`${COOKIE_PREFIX_KEY}_ep_credentials`, initialCookieValue);
  }

  return {
    set: (key: string, value: string): void => {
      state.set(key, value);
    },
    get: (key: string): any => {
      return state.get(key);
    },
    delete: (key: string) => {
      state.delete(key);
    },
  };
}
