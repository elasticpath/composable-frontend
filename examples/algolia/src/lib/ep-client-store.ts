import { Moltin as EPCCClient } from "@moltin/sdk";

type ClientStore = Record<ClientStoreTypes, EPCCClient>;

let _clientStore: ClientStore = {} as ClientStore;

export type ClientStoreTypes = "implicit" | "client-credentials";

/**
 * @internal Should only be used internally for client management
 */
export function _registerClient(
  client: EPCCClient,
  type: ClientStoreTypes
): EPCCClient {
  if (_clientStore && _clientStore[type]) {
    throw Error(`Already have a client registered with type ${type}`);
  }
  return (_clientStore[type] = client);
}

/**
 * @internal Should only be used internally for client management
 */
export function _getClientStore(type: ClientStoreTypes) {
  return _clientStore[type];
}
