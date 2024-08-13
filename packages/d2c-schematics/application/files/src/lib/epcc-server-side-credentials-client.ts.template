import "server-only";
import { gateway, StorageFactory } from "@elasticpath/js-sdk";
import { epccEnv } from "./resolve-epcc-env";
import { resolveEpccCustomRuleHeaders } from "./custom-rule-headers";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { EP_CURRENCY_CODE } from "./resolve-ep-currency-code";
import { CREDENTIALS_COOKIE_NAME } from "./cookie-constants";
import { cookies } from "next/headers";

const customHeaders = resolveEpccCustomRuleHeaders();

const { client_id, host, client_secret } = epccEnv;

export function getServerSideCredentialsClient() {
  const credentialsCookie = cookies().get(CREDENTIALS_COOKIE_NAME);

  return gateway({
    name: `${COOKIE_PREFIX_KEY}_creds`,
    client_id,
    client_secret,
    host,
    currency: EP_CURRENCY_CODE,
    ...(customHeaders ? { headers: customHeaders } : {}),
    reauth: false,
    storage: createServerSideNextCookieStorageFactory(credentialsCookie?.value),
  });
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
