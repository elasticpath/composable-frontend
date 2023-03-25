import { Client, OperationResult } from "@urql/core"
import {
  GetMarketplaceIntegrationByNameDocument,
  GetMarketplaceIntegrationByNameQuery,
  GetMarketplaceIntegrationByNameQueryVariables,
} from "../../codegen/gql/graphql"
import { MarketplaceIntegrationData } from "./get-integration-types"
import type { Response } from "../types"
import {
  handleCatchError,
  processAsIntegrationHubErrorResponse,
} from "../helpers"

export async function getMarketplaceIntegrationByName(
  urqlClient: Client,
  vars: GetMarketplaceIntegrationByNameQueryVariables
): Promise<Response<MarketplaceIntegrationData>> {
  try {
    const response = await gqlGetMarketplaceIntegrationByName(urqlClient, vars)

    const integrationData = response.data?.marketplaceIntegrations.nodes?.[0]

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

async function gqlGetMarketplaceIntegrationByName(
  urqlClient: Client,
  vars: GetMarketplaceIntegrationByNameQueryVariables
): Promise<
  OperationResult<
    GetMarketplaceIntegrationByNameQuery,
    GetMarketplaceIntegrationByNameQueryVariables
  >
> {
  return urqlClient
    .query(GetMarketplaceIntegrationByNameDocument, vars)
    .toPromise()
}
