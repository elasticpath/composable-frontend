import { Client, OperationResult } from "@urql/core"
import {
  DeployInstanceMutation,
  DeployInstanceMutationVariables,
} from "../../codegen/gql/graphql"
import { Response } from "../types"
import { DeployIntegrationInstanceDocument } from "../integration-hub-queries/integration-instance-query"

export type DeployedInstanceData = Omit<
  Exclude<DeployInstanceMutation["deployInstance"], null | undefined>,
  "__typename"
>

export async function deployIntegrationInstance(
  urqlClient: Client,
  vars: DeployInstanceMutationVariables
): Promise<Response<DeployedInstanceData>> {
  const response = await gqlDeployIntegrationInstance(urqlClient, vars)

  if (response.data && response.data?.deployInstance) {
    const deployedInstance = response.data?.deployInstance
    return {
      success: true,
      data: deployedInstance,
    }
  } else {
    return {
      success: false,
      error: new Error(`${response.error?.name} - ${response.error?.message}`),
    }
  }
}

async function gqlDeployIntegrationInstance(
  urqlClient: Client,
  vars: DeployInstanceMutationVariables
): Promise<
  OperationResult<DeployInstanceMutation, DeployInstanceMutationVariables>
> {
  return urqlClient
    .mutation(DeployIntegrationInstanceDocument, vars)
    .toPromise()
}
