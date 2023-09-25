import fetch from "node-fetch"
import { StoreCatalog, storeCatalogsResponseSchema } from "./catalog-schema"
import { Result } from "../../types/results"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "../../util/epcc-error"

export async function buildCatalogPrompts(
  apiUrl: string,
  token: string
): Promise<Result<{ name: string; value: StoreCatalog }[], Error>> {
  const catalogsResponse = await fetchStoreCatalogs(apiUrl, token)

  const parsedResponse = storeCatalogsResponseSchema.safeParse(catalogsResponse)

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
    data: mapCatalogsToStorePrompts(parsedResultData.data),
  }
}

function mapCatalogsToStorePrompts(catalogs: StoreCatalog[]) {
  return catalogs.map((catalog) => {
    return {
      name: `${catalog.attributes.name} - ${catalog.id}`,
      value: catalog,
    }
  })
}

async function fetchStoreCatalogs(
  apiUrl: string,
  token: string
): Promise<unknown> {
  const stores = await fetch(`${apiUrl}/pcm/catalogs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return stores.json()
}
