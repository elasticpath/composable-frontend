import fetch from "node-fetch"

export async function buildStorePrompts(apiUrl: string, token: string) {
  // TODO if access token is expired then refresh it
  const storesResponse = await fetchUserStores(apiUrl, token)

  return mapStoresToStorePrompts(storesResponse.data)
}

function mapStoresToStorePrompts(stores: Store[]) {
  return stores.map((store) => {
    return {
      name: `${store.name} - ${store.id}`,
      value: store,
    }
  })
}

export type Store = {
  id: string
  name: string
  store_type: string
  type: "store"
  ep_disabled: boolean
  meta: {
    timestamps: {
      created_at: "2023-04-26T11:12:36.493Z"
      updated_at: "2023-04-26T11:12:36.493Z"
    }
  }
}

async function fetchUserStores(apiUrl: string, token: string) {
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
