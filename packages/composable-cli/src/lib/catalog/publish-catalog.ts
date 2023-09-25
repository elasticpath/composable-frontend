import fetch from "node-fetch"
import { Result } from "../../types/results"
import { checkIsErrorResponse, resolveEPCCErrorMessage } from "../../util/epcc-error"
import { createReleaseResponseSchema, Release } from "./release-schema"

export async function publishCatalog(
  apiUrl: string,
  token: string,
  catalogId: string
): Promise<Result<Release, Error>> {
  const releaseResponse = await postCatalogRelease(apiUrl, token, catalogId)

  const parsedResponse = createReleaseResponseSchema.safeParse(releaseResponse)

  // Handle parsing errors
  if (!parsedResponse.success) {
    return {
      success: false,
      error: new Error(parsedResponse.error.message)
    }
  }

  const { data: parsedResultData } = parsedResponse

  //Handle epcc errors
  if (checkIsErrorResponse(parsedResultData)) {
    return {
      success: false,
      error: new Error(resolveEPCCErrorMessage(parsedResultData.errors))
    }
  }

  return {
    success: true,
    data: parsedResultData.data
  }
}

export async function getCatalogRelease(
  apiUrl: string,
  token: string,
  catalogId: string,
  releaseId: string,
): Promise<Result<Release, Error>> {
  const releaseResponse = await fetchCatalogRelease(apiUrl, token, catalogId, releaseId)

  const parsedResponse = createReleaseResponseSchema.safeParse(releaseResponse)

  // Handle parsing errors
  if (!parsedResponse.success) {
    return {
      success: false,
      error: new Error(parsedResponse.error.message)
    }
  }

  const { data: parsedResultData } = parsedResponse

  //Handle epcc errors
  if (checkIsErrorResponse(parsedResultData)) {
    return {
      success: false,
      error: new Error(resolveEPCCErrorMessage(parsedResultData.errors))
    }
  }

  return {
    success: true,
    data: parsedResultData.data
  }
}


async function fetchCatalogRelease(apiUrl: string,
                                   token: string, catalogId: string, releaseId: string) {
  const response = await fetch(`${apiUrl}/pcm/catalogs/${catalogId}/releases/${releaseId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return response.json()
}

async function postCatalogRelease(
  apiUrl: string,
  token: string,
  catalogId: string
): Promise<unknown> {
  const response = await fetch(`${apiUrl}/pcm/catalogs/${catalogId}/releases`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data: {
    export_full_delta: true
  }})
  })

  return response.json()
}
