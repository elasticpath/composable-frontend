import { Client, OperationResult } from "@urql/core"
import {
  CreateInstanceMutation,
  CreateInstanceMutationVariables,
  Instance,
} from "../../codegen/gql/graphql"
import { Response } from "../types"
import { CreateInstanceDocument } from "../integration-hub-queries/integration-query"

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
  } else if (response.data?.createInstance?.errors) {
    return {
      success: false,
      error: new Error(
        `[errors: ${response.data?.createInstance?.errors.map(
          (error) => `[${error.messages}]`
        )}`
      ),
    }
  } else {
    return {
      success: false,
      error: new Error(
        `[${response.error?.name} - ${
          response.error?.message
        }] ${JSON.stringify(response.error)}`
      ),
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
