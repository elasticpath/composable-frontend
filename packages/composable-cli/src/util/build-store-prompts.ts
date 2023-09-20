import fetch from "node-fetch"
import {
  UserStore,
  userStoresResponseSchema,
} from "../lib/stores/stores-schema"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "./epcc-error"

type PromptBuildSuccessResult<TData> = {
  success: true
  data: TData
}

type PromptBuildErrorResult<TError> = {
  success: false
  error: TError
}

type PromptBuildResult<TData, TError> =
  | PromptBuildSuccessResult<TData>
  | PromptBuildErrorResult<TError>

export async function buildStorePrompts(
  apiUrl: string,
  token: string
): Promise<PromptBuildResult<{ name: string; value: UserStore }[], Error>> {
  const storesResponse = await fetchUserStores(apiUrl, token)

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

async function fetchUserStores(
  apiUrl: string,
  token: string
): Promise<unknown> {
  const stores = await fetch(`${apiUrl}/v2/user/stores`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await stores.json()

  return result
}

export async function switchUserStore(
  apiUrl: string,
  token: string,
  storeId: string
) {
  const response = await fetch(
    `${apiUrl}/v1/account/stores/switch/${storeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const result = await response.json()

  return result
}

export async function fetchStore(
  apiUrl: string,
  token: string,
  storeId: String
): Promise<unknown> {
  const stores = await fetch(`${apiUrl}/v2/user/stores/${storeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const result = await stores.json()

  return result
}
