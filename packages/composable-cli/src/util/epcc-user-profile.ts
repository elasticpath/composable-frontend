import { checkIsErrorResponse, resolveEPCCErrorMessage } from "./epcc-error"
import { ZodError } from "zod"
import { EPCCEndpointResult } from "./epcc-endpoint.types"
import {
  EPCCUserProfileResponse,
  epccUserProfileResponseSchema,
  EPCCUserProfileSuccessResponse,
} from "../lib/epcc-user-profile-schema"
import { EpccRequester } from "./command"

export type UserProfileError = {
  code: "epcc-endpoint-error" | "unexpected-data-shape" | "unknown-error"
  message: string
}

export async function epccUserProfile(
  requester: EpccRequester,
  accessToken: string,
): Promise<
  EPCCEndpointResult<EPCCUserProfileSuccessResponse, UserProfileError>
> {
  try {
    const result = await getEPCCUserProfile(requester, accessToken)

    const parsedResult = epccUserProfileResponseSchema.safeParse(result)

    if (parsedResult.success) {
      return createResult(parsedResult.data)
    } else {
      return createUnexpectedDataShapeResult(parsedResult.error)
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return createUnknownErrorResult(e)
  }
}

function createUnknownErrorResult(
  e: unknown,
): EPCCEndpointResult<EPCCUserProfileSuccessResponse, UserProfileError> {
  return {
    success: false,
    error: {
      code: "unknown-error",
      message: `epccUserProfile: An unknown error occurred ${
        e instanceof Error ? e.message : e
      }`,
    },
  }
}

function createUnexpectedDataShapeResult(
  error: ZodError,
): EPCCEndpointResult<EPCCUserProfileSuccessResponse, UserProfileError> {
  return {
    success: false,
    error: {
      code: "unexpected-data-shape",
      message: error.message,
    },
  }
}

function createResult(
  response: EPCCUserProfileResponse,
): EPCCEndpointResult<EPCCUserProfileSuccessResponse, UserProfileError> {
  if (checkIsErrorResponse(response)) {
    return {
      success: false,
      error: {
        code: "epcc-endpoint-error",
        message: resolveEPCCErrorMessage(response.errors),
      },
    }
  }

  return {
    success: true,
    data: response,
  }
}

async function getEPCCUserProfile(
  requester: EpccRequester,
  accessToken: string,
): Promise<unknown> {
  return requester(`/v2/user`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json())
}
