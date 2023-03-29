import {
  ConfigOptions,
  gateway as EPCCGateway,
  MemoryStorageFactory,
} from "@moltin/sdk";
import { epccEnv } from "./resolve-epcc-env";
import { resolveEpccCustomRuleHeaders } from "./custom-rule-headers";
import { EP_CURRENCY_CODE } from "../lib/resolve-ep-currency-code";

const headers = resolveEpccCustomRuleHeaders();

const { client_id, client_secret, host } = epccEnv;

if (typeof client_secret !== "string") {
  throw Error(
    "Attempted to use client credentials client without a defined client_secret. This is most likely caused by trying to use server side client on the client side."
  );
}

const config: ConfigOptions = {
  client_id,
  client_secret,
  host,
  currency: EP_CURRENCY_CODE,
  storage: new MemoryStorageFactory(),
  ...(headers ? { headers } : {}),
};

export const epccServerClient = EPCCGateway(config);
