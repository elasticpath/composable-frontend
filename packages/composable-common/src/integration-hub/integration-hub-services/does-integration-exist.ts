import { Client, OperationResult } from "@urql/core"
import {
  CheckIfInstanceNameExistsDocument,
  CheckIfInstanceNameExistsQuery,
  CheckIfInstanceNameExistsQueryVariables,
} from "../../codegen/gql/graphql"

export async function doesIntegrationInstanceExist(
  urqlClient: Client,
  customerId: string,
  integrationName: string,
): Promise<boolean> {
  const resp = await gqlCheckIfInstanceExists(urqlClient, {
    customerId,
    name: integrationName,
  })

  return !!resp.data?.instances?.nodes?.length
}

async function gqlCheckIfInstanceExists(
  urqlClient: Client,
  vars: CheckIfInstanceNameExistsQueryVariables,
): Promise<
  OperationResult<
    CheckIfInstanceNameExistsQuery,
    CheckIfInstanceNameExistsQueryVariables
  >
> {
  return urqlClient.query(CheckIfInstanceNameExistsDocument, vars).toPromise()
}
