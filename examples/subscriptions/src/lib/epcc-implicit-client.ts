import { gateway, StorageFactory } from "@elasticpath/js-sdk";
import { epccEnv } from "./resolve-epcc-env";
import { resolveEpccCustomRuleHeaders } from "./custom-rule-headers";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";
import { EP_CURRENCY_CODE } from "./resolve-ep-currency-code";

const headers = resolveEpccCustomRuleHeaders();

const { client_id, host } = epccEnv;

export function getEpccImplicitClient() {
  return gateway({
    name: COOKIE_PREFIX_KEY,
    client_id,
    host,
    currency: EP_CURRENCY_CODE,
    ...(headers ? { headers } : {}),
    storage: createNextCookieStorageFactory(),
  });
}

function createNextCookieStorageFactory(): StorageFactory {
  return {
    set: (key: string, value: string): void => {
      setCookie(key, value, {
        sameSite: "strict",
      });
    },
    get: (key: string): any => {
      return getCookie(key);
    },
    delete: (key: string) => {
      deleteCookie(key);
    },
  };
}
