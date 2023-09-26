import { Result } from "../../types/results"
import {
  checkIsErrorResponse,
  resolveEPCCErrorMessage,
} from "../../util/epcc-error"
import { createReleaseResponseSchema, Release } from "./release-schema"
import { EpccRequester } from "../../util/command"

export async function publishCatalog(
  requester: EpccRequester,
  catalogId: string,
): Promise<Result<Release, Error>> {
  const releaseResponse = await postCatalogRelease(requester, catalogId)

  const parsedResponse = createReleaseResponseSchema.safeParse(releaseResponse)

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

export async function getCatalogRelease(
  requester: EpccRequester,
  catalogId: string,
  releaseId: string,
): Promise<Result<Release, Error>> {
  const releaseResponse = await fetchCatalogRelease(
    requester,
    catalogId,
    releaseId,
  )

  const parsedResponse = createReleaseResponseSchema.safeParse(releaseResponse)

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

async function fetchCatalogRelease(
  requester: EpccRequester,
  catalogId: string,
  releaseId: string,
) {
  const response = await requester(
    `/pcm/catalogs/${catalogId}/releases/${releaseId}`,
  )

  return response.json()
}

async function postCatalogRelease(
  requester: EpccRequester,
  catalogId: string,
): Promise<unknown> {
  const response = await requester(`/pcm/catalogs/${catalogId}/releases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        export_full_delta: true,
      },
    }),
  })

  return response.json()
}
