import { Client, OperationResult } from "@urql/core"
import {
  GetIntegrationQuery,
  GetIntegrationQueryVariables,
} from "../../codegen/gql/graphql"
import { GetIntegrationDocument } from "../integration-hub-queries/integration-query"
import { IntegrationData } from "./get-integration-types"
import type { Response } from "../types"
import {
  handleCatchError,
  processAsIntegrationHubErrorResponse,
} from "../helpers"

export async function getIntegration(
  urqlClient: Client,
  vars: GetIntegrationQueryVariables
): Promise<Response<IntegrationData>> {
  try {
    const response = await gqlGetIntegration(urqlClient, vars)

    const integrationData = response.data?.integration

    if (integrationData !== null && integrationData !== undefined) {
      return {
        success: true,
        data: integrationData,
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

async function gqlGetIntegration(
  urqlClient: Client,
  vars: GetIntegrationQueryVariables
): Promise<OperationResult<GetIntegrationQuery, GetIntegrationQueryVariables>> {
  return urqlClient.query(GetIntegrationDocument, vars).toPromise()
}
