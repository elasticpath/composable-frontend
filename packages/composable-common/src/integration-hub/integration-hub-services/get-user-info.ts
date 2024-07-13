import { Client, OperationResult } from "@urql/core"
import {
  GetUserInfoQuery,
  GetUserInfoQueryVariables,
} from "../../codegen/gql/graphql"
import { Response } from "../types"
import {
  handleCatchError,
  processAsIntegrationHubErrorResponse,
} from "../helpers"
import {
  GetUserInfoDocument,
  UserInfoFragment,
} from "../integration-hub-queries/user-queries"
import { useFragment } from "../../codegen/gql"

interface GetUserInfoResponse {
  customer?: {
    id: string
    allowAddInstance: boolean
    externalId: string
  } | null
}

export async function getUserInfo(
  urqlClient: Client,
): Promise<Response<GetUserInfoResponse>> {
  try {
    const response = await gqlGetUserInfo(urqlClient)

    const userInfoFragment =
      response.data &&
      useFragment(UserInfoFragment, response.data.authenticatedUser)

    if (userInfoFragment !== null && userInfoFragment !== undefined) {
      return {
        success: true,
        data: userInfoFragment as GetUserInfoResponse,
      }
    }

    return processAsIntegrationHubErrorResponse(response)
  } catch (err: unknown) {
    return {
      success: false,
      error: handleCatchError(err),
    }
  }
}

async function gqlGetUserInfo(
  urqlClient: Client,
): Promise<OperationResult<GetUserInfoQuery, GetUserInfoQueryVariables>> {
  return urqlClient.query(GetUserInfoDocument, {}).toPromise()
}
