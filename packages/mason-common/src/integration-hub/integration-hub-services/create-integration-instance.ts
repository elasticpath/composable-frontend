import { Client, OperationResult } from "@urql/core"
import {
  CreateInstanceMutation,
  CreateInstanceMutationVariables,
  Instance,
} from "../../codegen/gql/graphql"
import { Response } from "../types"
import { CreateInstanceDocument } from "../prismatic-queries/integration-query"

export async function createIntegrationInstance(
  urqlClient: Client,
  vars: CreateInstanceMutationVariables
): Promise<Response<Instance>> {
  const response = await gqlCreateIntegrationInstance(urqlClient, vars)

  if (response.data && response.data.createInstance?.instance) {
    const instance: Instance = response.data.createInstance.instance as Instance
    return {
      success: true,
      data: instance,
    }
  } else {
    return {
      success: false,
      error: new Error(`${response.error?.name} - ${response.error?.message}`),
    }
  }
}

async function gqlCreateIntegrationInstance(
  urqlClient: Client,
  vars: CreateInstanceMutationVariables
): Promise<
  OperationResult<CreateInstanceMutation, CreateInstanceMutationVariables>
> {
  return urqlClient.mutation(CreateInstanceDocument, vars).toPromise()
}
