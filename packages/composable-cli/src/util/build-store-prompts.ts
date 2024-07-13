import {
  UserStore,
  userStoresResponseSchema,
} from "../lib/stores/stores-schema"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "./epcc-error"
import { userSwitchStoreResponseSchema } from "../lib/stores/switch-store-schema"
import { Result } from "../types/results"
import { EpccRequester } from "./command"

export async function buildStorePrompts(
  requester: EpccRequester,
): Promise<Result<{ name: string; value: UserStore }[], Error>> {
  const storesResponse = await fetchUserStores(requester)

  const parsedResponse = userStoresResponseSchema.safeParse(storesResponse)

  // Handle parsing errors
  if (!parsedResponse.success) {
    return {
      success: false,
      error: new Error(parsedResponse.error.message),
    }
  }

  const { data: parsedResultData } = parsedResponse

  //Handle epcc errors
  if (checkIsErrorResponse(parsedResultData)) {
    return {
      success: false,
      error: new Error(resolveEPCCErrorMessage(parsedResultData.errors)),
    }
  }

  return {
    success: true,
    data: mapStoresToStorePrompts(parsedResultData.data),
  }
}

function mapStoresToStorePrompts(stores: UserStore[]) {
  return stores.map((store) => {
    return {
      name: `${store.name} - ${store.id}`,
      value: store,
    }
  })
}

async function fetchUserStores(requester: EpccRequester): Promise<unknown> {
  const stores = await requester(`/v2/user/stores`)

  return stores.json()
}

export async function switchUserStore(
  requester: EpccRequester,
  storeId: string,
): Promise<Result<{}, Error>> {
  const switchResult = await postSwitchUserStore(requester, storeId)

  const parsedResult = userSwitchStoreResponseSchema.safeParse(switchResult)

  if (!parsedResult.success) {
    return {
      success: false,
      error: new Error(parsedResult.error.message),
    }
  }

  return {
    success: true,
    data: {},
  }
}

export async function postSwitchUserStore(
  requester: EpccRequester,
  storeId: string,
): Promise<unknown> {
  const response = await requester(`/v1/account/stores/switch/${storeId}`, {
    method: "POST",
  })

  return response.json()
}

export async function fetchStore(
  requester: EpccRequester,
  storeId: String,
): Promise<unknown> {
  const stores = await requester(`/v2/user/stores/${storeId}`)

  return stores.json()
}
