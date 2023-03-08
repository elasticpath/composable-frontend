import { GetIntegrationQuery } from "../../../codegen/gql/graphql"

export type IntegrationData = Omit<
  Exclude<GetIntegrationQuery["integration"], null | undefined>,
  "__typename"
>
