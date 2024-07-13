import { StoreCatalog, storeCatalogsResponseSchema } from "./catalog-schema"
import { Result } from "../../types/results"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"
import { EpccRequester } from "../../util/command"

export async function getActiveStoreCatalogs(
  requester: EpccRequester,
): Promise<Result<StoreCatalog[], Error>> {
  const catalogsResponse = await fetchStoreCatalogs(requester)

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
    data: parsedResultData.data,
  }
}

export async function buildCatalogPrompts(
  catalogs: StoreCatalog[],
): Promise<Result<{ name: string; value: StoreCatalog }[], Error>> {
  return {
    success: true,
    data: mapCatalogsToStorePrompts(catalogs),
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

async function fetchStoreCatalogs(requester: EpccRequester): Promise<unknown> {
  const stores = await requester(`/pcm/catalogs`)

  return stores.json()
}
